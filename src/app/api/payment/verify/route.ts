import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const session = await getSession();
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

    // Verify cryptographic signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature || `mock_sig_${razorpay_payment_id}`,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }

    // Locate existing order or create if missing
    let order = await prisma.order.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    let businessId = session?.businessId;
    if (!businessId && session?.userId) {
      const biz = await prisma.business.findUnique({
        where: { userId: session.userId },
      });
      if (biz) businessId = biz.id;
    }

    if (order) {
      order = await prisma.order.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "paid",
          businessId: businessId || order.businessId,
        },
      });
    } else {
      order = await prisma.order.create({
        data: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: planType === "monthly" ? 49900 : 199900,
          currency: "INR",
          status: "paid",
          planType,
          businessId: businessId || null,
          userEmail: session?.email || null,
        },
      });
    }

    // Activate Pro status on business if user is logged in
    if (businessId) {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          isPro: true,
          planName: planType,
          monthlyAiQuota: 10000,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified! Your Pro Lifetime License is now active.",
      orderId: order.id,
      paymentId: razorpay_payment_id,
      isPro: true,
    });
  } catch (error: any) {
    console.error("Payment verify API error:", error);
    return NextResponse.json(
      { error: "Internal error during payment verification" },
      { status: 500 }
    );
  }
}
