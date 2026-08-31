import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const webhookSignature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    // If webhook secret is configured, verify authenticity
    if (webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, webhookSignature, webhookSecret);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await prisma.order.findUnique({
          where: { razorpayOrderId },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "paid",
              razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
            },
          });

          if (order.businessId) {
            await prisma.business.update({
              where: { id: order.businessId },
              data: {
                isPro: true,
                planName: order.planType || "lifetime",
                monthlyAiQuota: 10000,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
