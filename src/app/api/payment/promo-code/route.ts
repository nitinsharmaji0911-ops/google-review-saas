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

    const userId = session?.userId;
    const userEmail = session?.email;
    const businessSlug = clientSlug || session?.businessSlug;

    // 7 Days from now
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const activationData = {
      isPro: true,
      planName: "7-Day VIP Free Trial",
      trialEndsAt,
      promoCodeUsed: cleanCode,
      activatedAt: new Date().toISOString(),
    };

    // 1. Update User document directly in Firestore
    if (userEmail) {
      const user = await FirestoreDB.getUserByEmail(userEmail);
      if (user) {
        await FirestoreREST.setDocument("users", user.id, {
          ...user,
          ...activationData,
        });
      }
    }

    // 2. Look up and update business
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

    const targetSlug = business?.slug || businessSlug || (business?.name ? business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "my-business");

    const finalReviewUrl = clientGoogleUrl || business?.googleReviewUrl || "";

    if (business) {
      await FirestoreREST.setDocument("businesses", business.slug || business.id, {
        ...business,
        ...(clientGoogleUrl ? { googleReviewUrl: clientGoogleUrl } : {}),
        ...activationData,
      });
    } else {
      // Create active business placeholder if not yet created
      await FirestoreREST.setDocument("businesses", targetSlug, {
        id: targetSlug,
        slug: targetSlug,
        name: session?.email?.split("@")[0] || "My Business",
        userId: userId || "user",
        category: "cafe",
        googleReviewUrl: finalReviewUrl,
        ...activationData,
      });
    }

    // 3. Update in Prisma if possible
    try {
      if (business?.id) {
        await prisma.business.update({
          where: { id: business.id },
          data: {
            isPro: true,
            planName: "7-Day VIP Free Trial",
          },
        });
      }
    } catch {}

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
