import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FirestoreDB } from "@/lib/firestore-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const businessSlug = body.businessSlug || body.slug;
    const { eventType, metadata } = body;

    if (!businessSlug || !eventType) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    // 1. Track event in Firestore (Primary Cloud Store)
    await FirestoreDB.trackEvent(businessSlug, eventType, metadata).catch((e) => {
      console.warn("Firestore trackEvent note:", e);
    });

    // 2. Also record event in Prisma database if exists
    try {
      const business = await prisma.business.findUnique({
        where: { slug: businessSlug },
      });

      if (business) {
        await prisma.analyticsEvent.create({
          data: {
            businessId: business.id,
            eventType,
            metadata: metadata ? JSON.stringify(metadata) : null,
          },
        });
      }
    } catch (prismaErr) {
      console.warn("Prisma analyticsEvent note:", prismaErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Tracking error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
