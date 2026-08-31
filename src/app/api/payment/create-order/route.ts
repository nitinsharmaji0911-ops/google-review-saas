import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpayInstance } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    let session = null;
    try {
      session = await getSession();
    } catch {
      // Guest checkout session
    }

    const body = await req.json().catch(() => ({}));
    const { planType = "lifetime", email } = body;

    // Pricing definition in Paise (1 INR = 100 Paise)
    let amountInPaise = 199900; // ₹1,999 Lifetime
    let planLabel = "₹1,999 Lifetime License";

    if (planType === "monthly") {
      amountInPaise = 49900; // ₹499/mo
      planLabel = "Monthly Pro Plan";
    }

    const key_id =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

    let razorpayOrderId = `order_${Date.now()}`;
    let isMock = true;

    // If real/test keys are provided in environment, create live Razorpay order
    if (key_id && key_secret && !key_id.includes("placeholder")) {
      try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
          notes: {
            planType,
            userId: session?.userId || "guest",
            userEmail: session?.email || email || "guest@welurik.com",
          },
        });
        razorpayOrderId = order.id;
        isMock = false;
      } catch (pgError: any) {
        console.error("Razorpay order creation error:", pgError);
        return NextResponse.json(
          {
            error: pgError.message || "Failed to initialize payment order with Razorpay",
          },
          { status: 500 }
        );
      }
    }

    // Save order record to Prisma (with fallback if database is read-only in serverless)
    let orderRecordId = `ord_${Date.now()}`;
    try {
      let businessId = session?.businessId;
      if (!businessId && session?.userId) {
        const biz = await prisma.business.findUnique({
          where: { userId: session.userId },
        });
        if (biz) businessId = biz.id;
      }

      const orderRecord = await prisma.order.create({
        data: {
          businessId: businessId || null,
          userEmail: session?.email || email || null,
          razorpayOrderId,
          amount: amountInPaise,
          currency: "INR",
          status: "created",
          planType,
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
        },
      });
      orderRecordId = orderRecord.id;
    } catch (dbErr) {
      console.warn("Database order record creation fallback:", dbErr);
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: key_id || "rzp_test_placeholder",
      isMock,
      planLabel,
      planType,
      prefill: {
        email: session?.email || email || "",
      },
      orderRecordId,
    });
  } catch (error: any) {
    console.error("Create order API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error during order initialization" },
      { status: 500 }
    );
  }
}
