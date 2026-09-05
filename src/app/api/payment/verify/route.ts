import { NextRequest, NextResponse } from "next/server";
import { getSession, createSessionPayload, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { FirestoreDB } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest | Request) {
  try {
    const rl = await checkRateLimit(req, "payment_verify", { limit: 15, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    let session = null;
    try {
      session = await getSession();
    } catch {
      // Guest session
    }

    const body = await req.json().catch(() => ({}));
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType = "lifetime",
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: "Missing required order or payment identifiers" },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpay_signature) {
      return NextResponse.json({ error: "Missing payment signature" }, { status: 400 });
    }

    if (!key_secret) {
      return NextResponse.json({ error: "Payment gateway configuration error" }, { status: 500 });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }

    // Update database records safely
    let orderId = `ord_${Date.now()}`;
    let businessId = session?.businessId;
    let businessSlug = session?.businessSlug;

    if (!businessId && session?.userId) {
      try {
        const biz = await prisma.business.findUnique({
          where: { userId: session.userId },
        });
        if (biz) {
          businessId = biz.id;
          if (!businessSlug) businessSlug = biz.slug;
        }
      } catch {}
    }

    // 1. Update in Prisma
    try {
      let order = await prisma.order.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (order) {
        order = await prisma.order.update({
          where: { razorpayOrderId: razorpay_order_id },
          data: {
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature || "verified",
            status: "paid",
            businessId: businessId || order.businessId,
          },
        });
        orderId = order.id;
      } else {
        const newOrder = await prisma.order.create({
          data: {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature || "verified",
            amount: 199900,
            currency: "INR",
            status: "paid",
            planType,
            businessId: businessId || null,
            userEmail: session?.email || null,
          },
        });
        orderId = newOrder.id;
      }

      // Activate Lifetime Pro status in Prisma
      if (businessId) {
        await prisma.business.update({
          where: { id: businessId },
          data: {
            isPro: true,
            planName: "lifetime",
            monthlyAiQuota: 999999,
          },
        });
      }
    } catch (dbErr) {
      console.warn("Database order update fallback:", dbErr);
    }

    // 2. CRITICAL: Permanently activate Lifetime Pro in Firestore (Primary User & Business Store)
    const userEmail = session?.email;
    const userId = session?.userId;
    const activationTime = new Date().toISOString();

    // A. Update User in Firestore
    let fsUser: any = null;
    if (userEmail) {
      try {
        fsUser = await FirestoreDB.getUserByEmail(userEmail);
        if (fsUser) {
          await FirestoreREST.setDocument("users", fsUser.id, {
            ...fsUser,
            isPro: true,
            planName: "Lifetime License",
            planType: "lifetime",
            paidAt: activationTime,
          });
        }
      } catch (fsUserErr) {
        console.warn("Firestore user Pro update note:", fsUserErr);
      }
    }

    // B. Update Business in Firestore
    let fsBusiness: any = null;
    try {
      if (userId) {
        fsBusiness = await FirestoreDB.getBusinessByUserId(userId);
      }
      if (!fsBusiness && (businessSlug || fsUser?.businessSlug)) {
        fsBusiness = await FirestoreDB.getBusinessBySlug(businessSlug || fsUser?.businessSlug);
      }
      if (!fsBusiness && userEmail) {
        const defaultSlug = userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
        fsBusiness = await FirestoreDB.getBusinessBySlug(defaultSlug);
      }

      const targetSlug = fsBusiness?.slug || businessSlug || fsUser?.businessSlug || (userEmail ? userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-") : "my-business");

      const finalBizDoc = {
        ...(fsBusiness || {}),
        id: fsBusiness?.id || targetSlug,
        slug: targetSlug,
        name: fsBusiness?.name || (userEmail ? userEmail.split("@")[0] : "My Business"),
        userId: userId || fsBusiness?.userId || "user",
        category: fsBusiness?.category || "cafe",
        isPro: true,
        planName: "Lifetime License",
        planType: "lifetime",
        monthlyAiQuota: 999999,
        paidAt: activationTime,
      };

      await FirestoreREST.setDocument("businesses", targetSlug, finalBizDoc);

      if (userId) {
        await FirestoreREST.setDocument("user_businesses", userId, {
          userId,
          businessSlug: targetSlug,
          businessId: targetSlug,
          isPro: true,
          name: finalBizDoc.name,
          paidAt: activationTime,
        });
      }
    } catch (fsBizErr) {
      console.warn("Firestore business Pro update note:", fsBizErr);
    }

    // Persist immutable order record in Firestore
    try {
      await FirestoreREST.setDocument("orders", razorpay_order_id, {
        id: razorpay_order_id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: 199900,
        currency: "INR",
        status: "paid",
        planType: "lifetime",
        planName: "Lifetime License",
        userId: userId || "guest",
        userEmail: userEmail || "",
        businessSlug: fsBusiness?.slug || businessSlug || "",
        createdAt: activationTime,
      });
    } catch (orderSaveErr) {
      console.warn("Firestore order record note:", orderSaveErr);
    }

    const res = NextResponse.json({
      success: true,
      message: "Payment successfully verified! Your ₹1,999 only Lifetime License is now active.",
      orderId,
      paymentId: razorpay_payment_id,
      isPro: true,
    });

    // Re-issue fresh session cookie so edge middleware & layout immediately reflect Pro status
    if (session && session.userId && session.email) {
      const payload = createSessionPayload({
        userId: session.userId,
        email: session.email,
        businessId: businessId || session.businessId,
        businessSlug: fsBusiness?.slug || businessSlug || session.businessSlug,
      });

      res.cookies.set(SESSION_COOKIE_NAME, payload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return res;
  } catch (error: any) {
    console.error("Payment verify API error:", error);
    return NextResponse.json(
      { error: "Internal error during payment verification" },
      { status: 500 }
    );
  }
}
