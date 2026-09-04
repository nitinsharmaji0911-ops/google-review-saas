import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpayInstance } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Please sign in or create an account before proceeding to payment." },
        { status: 401 }
      );
    }

    // Official Pricing: ₹1,999 Lifetime License (199900 Paise)
    const amountInPaise = 199900;
    const planLabel = "₹1,999 only Lifetime License";
    const planType = "lifetime";

    const key_id =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId = `order_${Date.now()}`;
    let isMock = false;

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
            userId: session.userId,
            userEmail: session.email,
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
          userEmail: session.email || null,
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
        email: session.email,
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
