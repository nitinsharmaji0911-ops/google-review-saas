import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessSlug, eventType, metadata } = body;

    if (!businessSlug || !eventType) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Tracking error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
