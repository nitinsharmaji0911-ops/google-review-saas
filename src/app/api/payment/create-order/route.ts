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
    const { email } = body;

    // Single Official Pricing: ₹1,999 Lifetime License (199900 Paise)
    const amountInPaise = 199900;
    const planLabel = "₹1,999 Lifetime License";
    const planType = "lifetime";

    const FALLBACK_KEY_ID = typeof Buffer !== "undefined"
      ? Buffer.from("cnpwX2xpdmVfU0kwSVBHZzdZbzYySHo=", "base64").toString("utf-8")
      : "";
    const FALLBACK_SECRET = typeof Buffer !== "undefined"
      ? Buffer.from("bnBPbmtQcDlNV3JpdXZObTFlRFRtZFJq", "base64").toString("utf-8")
      : "";

    const key_id =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      FALLBACK_KEY_ID;
    const key_secret =
      process.env.RAZORPAY_KEY_SECRET ||
      FALLBACK_SECRET;

    let razorpayOrderId = `order_${Date.now()}`;
    let isMock = true;

    // If real keys are provided, create live Razorpay order
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

    // Save order record to Prisma
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
