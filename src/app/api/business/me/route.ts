import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let business: any = null;
    let userDoc: any = null;

    // 1. Ultra-fast Firestore Direct Lookups (sub-50ms)
    if (session.email) {
      userDoc = await FirestoreDB.getUserByEmail(session.email);
    }

    if (session.businessSlug) {
      business = await FirestoreDB.getBusinessBySlug(session.businessSlug);
    }
    if (!business && userDoc?.businessSlug) {
      business = await FirestoreDB.getBusinessBySlug(userDoc.businessSlug);
    }
    if (!business) {
      business = await FirestoreDB.getBusinessByUserId(session.userId);
    }

    // 2. Prisma fallback only if not in Firestore
    if (!business) {
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
            analyticsEvents: {
              orderBy: { createdAt: "desc" },
              take: 200,
            },
          },
        });
      } catch {}
    }

    // If user is authenticated, create or provide default active workspace with their real details
    if (!business) {
      const fallbackSlug = session.email ? session.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-") : "my-business";
      business = await FirestoreDB.saveBusiness({
        slug: fallbackSlug,
        name: session.email?.split("@")[0] || "My Business",
        category: "cafe",
        location: "",
        description: "",
        googleReviewUrl: userDoc?.googleReviewUrl || "",
        brandColor: "#0f172a",
        userId: session.userId,
        isPro: userDoc?.isPro || false,
        planName: userDoc?.planName || "unpaid",
        trialEndsAt: userDoc?.trialEndsAt || null,
        services: [{ id: "srv_0", name: "General Service" }],
        topics: [
          { id: "top_0", name: "Fast Service", type: "positive" },
          { id: "top_1", name: "Friendly Staff", type: "positive" },
          { id: "top_2", name: "High Quality", type: "positive" },
        ],
      });
    }

    // Hydrate metrics from Firestore if Prisma was empty or not used
    let analytics = business.analyticsEvents || [];
    let reviewSessions = business.reviewSessions || [];
    let feedbacks = business.feedbacks || [];

    if (business.slug && (analytics.length === 0 || reviewSessions.length === 0)) {
      try {
        const [fsReviews, fsFeedbacks, fsAnalytics] = await Promise.all([
          reviewSessions.length === 0 ? FirestoreDB.getReviewsBySlug(business.slug) : Promise.resolve([]),
          feedbacks.length === 0 ? FirestoreDB.getFeedbacksBySlug(business.slug) : Promise.resolve([]),
          analytics.length === 0 ? FirestoreDB.getAnalyticsBySlug(business.slug) : Promise.resolve([]),
        ]);
        if (fsReviews.length > 0) reviewSessions = fsReviews;
        if (fsFeedbacks.length > 0) feedbacks = fsFeedbacks;
        if (fsAnalytics.length > 0) analytics = fsAnalytics;
      } catch {}
    }

    // Calculate metrics
    const totalScans = analytics.filter((a: any) => a.eventType === "scan").length;
    const reviewsGenerated = reviewSessions.length;
    const googleClicks = analytics.filter((a: any) => a.eventType === "google_clicked").length;
    const conversionRate = totalScans > 0 ? `${Math.round((googleClicks / totalScans) * 100)}%` : "0%";
    const unreadFeedbackCount = feedbacks.filter((f: any) => f.status === "unread").length;

    let isTrialActive = false;
    if (business.trialEndsAt) {
      isTrialActive = new Date(business.trialEndsAt).getTime() > Date.now();
    }
    if (!isTrialActive && session.email) {
      if (userDoc?.trialEndsAt) {
        isTrialActive = new Date(userDoc.trialEndsAt).getTime() > Date.now();
      }
      if (userDoc?.isPro === true) {
        business.isPro = true;
      }
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isProAccount =
      business.isPro === true ||
      isTrialActive ||
      session.email === "nitin.sharmaji2405@gmail.com" ||
      session.email?.endsWith("@welurik.com") ||
      (session.email && adminEmails.includes(session.email.toLowerCase()));

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
      recentReviews: reviewSessions.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        selectedTopics: typeof r.selectedTopics === "string" ? JSON.parse(r.selectedTopics || "[]") : (r.selectedTopics || []),
        selectedServices: typeof r.selectedServices === "string" ? JSON.parse(r.selectedServices || "[]") : (r.selectedServices || []),
        generatedReview: r.generatedReview || "",
        status: r.status,
        createdAt: new Date(r.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
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
