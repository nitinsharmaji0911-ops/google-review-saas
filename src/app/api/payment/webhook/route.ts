import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const webhookSignature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured on server.");
      return NextResponse.json({ error: "Webhook secret is unconfigured" }, { status: 500 });
    }

    const isValid = verifyWebhookSignature(rawBody, webhookSignature, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
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
            }).catch(() => {});
          }

          if (order.userEmail) {
            try {
              const { FirestoreDB } = await import("@/lib/firestore-db");
              const { FirestoreREST } = await import("@/lib/firestore-rest");
              const u = await FirestoreDB.getUserByEmail(order.userEmail);
              if (u) {
                await FirestoreREST.setDocument("users", u.id, {
                  ...u,
                  isPro: true,
                  planName: "Lifetime License",
                  planType: "lifetime",
                });
                if (u.businessSlug) {
                  const b = await FirestoreDB.getBusinessBySlug(u.businessSlug);
                  if (b) {
                    await FirestoreREST.setDocument("businesses", b.slug || b.id, {
                      ...b,
                      isPro: true,
                      planName: "Lifetime License",
                      planType: "lifetime",
                    });
                  }
                }
              }
            } catch (fsWebhookErr) {
              console.warn("Firestore webhook Pro sync note:", fsWebhookErr);
            }
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
