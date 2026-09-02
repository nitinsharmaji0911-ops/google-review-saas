import { NextRequest, NextResponse } from "next/server";
import { getSession, createSessionPayload, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";

export const dynamic = "force-dynamic";

// Valid trial & VIP promo codes (case-insensitive)
const VALID_PROMO_CODES = [
  "VIP7",
  "FRIENDS7",
  "WELURIK7",
  "FREE7",
  "TRIAL7",
  "NITIN7",
  "SPECIAL7",
  "FRIEND7",
  "LAUNCH100",
  "WELURIK100",
  "FREE100",
  "VIP100",
  "PRO100",
  "ZERO100",
  "DISCOUNT100",
  "TEST100",
  "REVIEW100",
  "MAPS100",
  "GOOGLE100",
  "PRO7",
  "VIP",
  "FREE",
  "TRIAL",
  "PROMO",
  "LAUNCH",
  "OFFER",
];

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { code, businessSlug: clientSlug, businessId: clientId, googleReviewUrl: clientGoogleUrl } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter a valid promo code." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    if (!VALID_PROMO_CODES.includes(cleanCode)) {
      return NextResponse.json(
        { success: false, error: "Invalid promo code. Please check with the administrator." },
        { status: 400 }
      );
    }

    const userId = session.userId;
    const userEmail = session.email;
    const businessSlug = clientSlug || session.businessSlug;

    // 7 Days from now for trial, or 365 days for 100% codes
    const isFullPass = cleanCode.includes("100") || cleanCode === "VIP" || cleanCode === "LAUNCH";
    const durationDays = isFullPass ? 365 : 7;
    const trialEndsAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const activationData = {
      isPro: true,
      planName: isFullPass ? "VIP Pro License" : "7-Day VIP Free Trial",
      trialEndsAt,
      promoCodeUsed: cleanCode,
      activatedAt: new Date().toISOString(),
    };

    // 1. Look up existing business
    let business: any = null;
    if (userId) {
      business = await FirestoreDB.getBusinessByUserId(userId);
    }
    if (!business && businessSlug) {
      business = await FirestoreDB.getBusinessBySlug(businessSlug);
    }
    if (!business && clientId) {
      business = await FirestoreREST.getDocument("businesses", clientId);
    }
    if (!business && userEmail) {
      const defaultSlug = userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
      business = await FirestoreDB.getBusinessBySlug(defaultSlug);
    }

    const targetSlug = business?.slug || businessSlug || (userEmail ? userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-") : "my-business");
    const finalReviewUrl = clientGoogleUrl || business?.googleReviewUrl || "";

    // 2. Save/update business in Firestore
    const finalBusinessDoc = {
      ...(business || {}),
      id: business?.id || targetSlug,
      slug: targetSlug,
      name: business?.name || (userEmail ? userEmail.split("@")[0] : "My Business"),
      userId: userId,
      category: business?.category || "cafe",
      googleReviewUrl: finalReviewUrl,
      brandColor: business?.brandColor || "#16A34A",
      ...activationData,
    };

    await FirestoreREST.setDocument("businesses", targetSlug, finalBusinessDoc);

    // 3. Fast O(1) link in user_businesses
    await FirestoreREST.setDocument("user_businesses", userId, {
      userId,
      businessSlug: targetSlug,
      businessId: targetSlug,
      isPro: true,
      trialEndsAt,
      name: finalBusinessDoc.name,
    });

    // 4. Update User document directly in Firestore
    if (userEmail) {
      const user = await FirestoreDB.getUserByEmail(userEmail);
      if (user) {
        await FirestoreREST.setDocument("users", user.id, {
          ...user,
          businessSlug: targetSlug,
          businessId: targetSlug,
          ...activationData,
        });
      }
    }

    // 5. Update in Prisma if available
    try {
      if (business?.id) {
        await prisma.business.update({
          where: { id: business.id },
          data: {
            isPro: true,
            planName: activationData.planName,
          },
        });
      }
    } catch {}

    const res = NextResponse.json({
      success: true,
      message: `🎉 Code "${cleanCode}" Applied! Your VIP Pro Access is active.`,
      trialEndsAt,
      isPro: true,
      businessSlug: targetSlug,
      redirect: "/dashboard",
    });

    // 6. Re-issue fresh session cookie so edge middleware & layout immediately reflect Pro status
    const payload = createSessionPayload({
      userId,
      email: userEmail,
      businessId: targetSlug,
      businessSlug: targetSlug,
    });

    res.cookies.set(SESSION_COOKIE_NAME, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (error: any) {
    console.error("Promo code activation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to apply promo code. Please try again." },
      { status: 500 }
    );
  }
}
