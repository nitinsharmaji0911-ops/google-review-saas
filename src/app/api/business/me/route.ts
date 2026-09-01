import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 1. Query Prisma by userId
    let business: any = null;
    try {
      business = await prisma.business.findUnique({
        where: { userId: session.userId },
        include: {
          services: true,
          topics: true,
          reviewSessions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          feedbacks: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          analyticsEvents: true,
        },
      });
    } catch (err) {
      console.warn("Prisma get business/me note:", err);
    }

    // 2. Query Firestore if not found in Prisma
    if (!business) {
      business = await FirestoreDB.getBusinessByUserId(session.userId);
      if (!business && session.businessSlug) {
        business = await FirestoreDB.getBusinessBySlug(session.businessSlug);
      }
    }

    if (!business) {
      return NextResponse.json({ success: true, business: null });
    }

    // Calculate metrics
    const analytics = business.analyticsEvents || [];
    const totalScans = analytics.filter((a: any) => a.eventType === "scan").length;
    const reviewsGenerated = (business.reviewSessions || []).length;
    const googleClicks = analytics.filter((a: any) => a.eventType === "google_clicked").length;
    const conversionRate = totalScans > 0 ? `${Math.round((googleClicks / totalScans) * 100)}%` : "0%";

    let isTrialActive = false;
    if (business.trialEndsAt) {
      isTrialActive = new Date(business.trialEndsAt).getTime() > Date.now();
    }

    const isProAccount =
      business.isPro === true ||
      isTrialActive ||
      session.email === "nitin.sharmaji2405@gmail.com" ||
      session.email?.endsWith("@welurik.com");

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        category: business.category,
        location: business.location || "",
        description: business.description || "",
        googleReviewUrl: business.googleReviewUrl,
        brandColor: business.brandColor || "#16A34A",
        phone: business.phone || "",
        isPro: isProAccount,
        trialEndsAt: business.trialEndsAt,
        isTrialActive,
        planName: business.planName || (isTrialActive ? "7-Day VIP Free Trial" : "lifetime"),
        monthlyAiQuota: business.monthlyAiQuota || 10000,
        aiCallsThisMonth: business.aiCallsThisMonth || 0,
        services: business.services || [],
        topics: business.topics || [],
      },
      metrics: {
        totalScans,
        reviewsGenerated,
        googleClicks,
        conversionRate,
      },
      recentReviews: (business.reviewSessions || []).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        selectedTopics: typeof r.selectedTopics === "string" ? JSON.parse(r.selectedTopics || "[]") : (r.selectedTopics || []),
        selectedServices: typeof r.selectedServices === "string" ? JSON.parse(r.selectedServices || "[]") : (r.selectedServices || []),
        generatedReview: r.generatedReview || "",
        status: r.status,
        createdAt: new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      })),
      unreadFeedbackCount,
    });
  } catch (error: any) {
    console.error("GET /api/business/me error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, category, location, description, googleReviewUrl, brandColor, phone, services, topics } = body;

    if (!name && !googleReviewUrl) {
      return NextResponse.json({ success: false, error: "Name and Google Review URL are required" }, { status: 400 });
    }

    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : `biz-${Date.now().toString(36)}`;

    // Update or create in Prisma
    let updatedBusiness: any = null;
    try {
      const existing = await prisma.business.findUnique({
        where: { userId: session.userId },
      });

      if (existing) {
        updatedBusiness = await prisma.business.update({
          where: { userId: session.userId },
          data: {
            name: name !== undefined ? name : existing.name,
            category: category !== undefined ? category : existing.category,
            location: location !== undefined ? location : existing.location,
            description: description !== undefined ? description : existing.description,
            googleReviewUrl: googleReviewUrl !== undefined ? googleReviewUrl : existing.googleReviewUrl,
            brandColor: brandColor !== undefined ? brandColor : existing.brandColor,
            phone: phone !== undefined ? phone : existing.phone,
          },
        });
      } else {
        updatedBusiness = await prisma.business.create({
          data: {
            userId: session.userId,
            name: name || "My Business",
            slug,
            category: category || "cafe",
            location: location || "",
            description: description || "",
            googleReviewUrl: googleReviewUrl || "",
            brandColor: brandColor || "#16A34A",
            phone: phone || "",
          },
        });
      }

      // Update services if provided
      if (Array.isArray(services) && updatedBusiness) {
        await prisma.businessService.deleteMany({ where: { businessId: updatedBusiness.id } });
        for (const s of services) {
          const sName = typeof s === "string" ? s.trim() : s.name?.trim();
          if (sName) {
            await prisma.businessService.create({
              data: { businessId: updatedBusiness.id, name: sName },
            });
          }
        }
      }

      // Update topics if provided
      if (Array.isArray(topics) && updatedBusiness) {
        await prisma.businessTopic.deleteMany({ where: { businessId: updatedBusiness.id } });
        for (const t of topics) {
          const tName = typeof t === "string" ? t.trim() : t.name?.trim();
          const tType = typeof t === "object" && t.type ? t.type : "positive";
          if (tName) {
            await prisma.businessTopic.create({
              data: { businessId: updatedBusiness.id, name: tName, type: tType },
            });
          }
        }
      }
    } catch (dbErr) {
      console.warn("Prisma business update note:", dbErr);
    }

    // Sync with Firestore
    const fsData = {
      userId: session.userId,
      name: name || "My Business",
      slug: updatedBusiness?.slug || slug,
      category: category || "cafe",
      location: location || "",
      description: description || "",
      googleReviewUrl: googleReviewUrl || "",
      brandColor: brandColor || "#16A34A",
      phone: phone || "",
      services: Array.isArray(services) ? services.map((s, idx) => ({ id: `s_${idx}`, name: typeof s === "string" ? s : s.name })) : [],
      topics: Array.isArray(topics) ? topics.map((t, idx) => ({ id: `t_${idx}`, name: typeof t === "string" ? t : t.name, type: typeof t === "object" ? t.type : "positive" })) : [],
    };
    await FirestoreDB.saveBusiness(fsData).catch(() => {});

    return NextResponse.json({ success: true, business: updatedBusiness || fsData });
  } catch (error: any) {
    console.error("PUT /api/business/me error:", error);
    return NextResponse.json({ success: false, error: "Failed to save business profile" }, { status: 500 });
  }
}
