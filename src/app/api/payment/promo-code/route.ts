import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";

export const dynamic = "force-dynamic";

// Valid 7-day trial promo codes (case-insensitive)
const VALID_PROMO_CODES = [
  "VIP7",
  "FRIENDS7",
  "WELURIK7",
  "FREE7",
  "TRIAL7",
  "NITIN7",
  "SPECIAL7",
  "FRIEND7"
];

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const { code, businessSlug: clientSlug, businessId: clientId } = body;

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

    const userId = session?.userId;
    const businessSlug = clientSlug || session?.businessSlug;

    // Look up business to activate
    let business: any = null;

    if (userId) {
      business = await FirestoreDB.getBusinessByUserId(userId);
    }
    if (!business && businessSlug) {
      business = await FirestoreDB.getBusinessBySlug(businessSlug);
    }
    if (!business && clientId) {
      business = await FirestoreDB.getBusinessById(clientId);
    }

    // 7 Days from now
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const activationData = {
      isPro: true,
      planName: "7-Day VIP Free Trial",
      trialEndsAt,
      promoCodeUsed: cleanCode,
      activatedAt: new Date().toISOString(),
    };

    if (business) {
      // 1. Update in Firestore
      await FirestoreREST.setDocument("businesses", business.slug || business.id, {
        ...business,
        ...activationData,
      });

      // 2. Update in Prisma
      try {
        await prisma.business.update({
          where: { id: business.id },
          data: {
            isPro: true,
            planName: "7-Day VIP Free Trial",
          },
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Code "${cleanCode}" Applied! Your 7-Day Free VIP Trial is active.`,
      trialEndsAt,
      redirect: "/dashboard",
    });
  } catch (error: any) {
    console.error("Promo code activation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to apply promo code. Please try again." },
      { status: 500 }
    );
  }
}
