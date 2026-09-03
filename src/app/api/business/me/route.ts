import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";
import { getCategoryById } from "@/lib/categories";

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

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const normalizedEmail = (session.email || "").toLowerCase().trim();
    const isFounderSuperAdmin =
      normalizedEmail === "nitin.sharmaji0512@gmail.com" ||
      normalizedEmail === "nitin.sharmaji2405@gmail.com" ||
      adminEmails.includes(normalizedEmail);

    let isTrialActive = false;
    // Check trial only if not explicitly revoked
    if (business.trialEndsAt && business.isPro !== false && userDoc?.isPro !== false) {
      isTrialActive = new Date(business.trialEndsAt).getTime() > Date.now();
    }
    if (!isTrialActive && session.email && business.isPro !== false && userDoc?.isPro !== false) {
      if (userDoc?.trialEndsAt) {
        isTrialActive = new Date(userDoc.trialEndsAt).getTime() > Date.now();
      }
    }

    // Determine final isProAccount status
    let isProAccount = false;
    if (isFounderSuperAdmin) {
      isProAccount = true;
    } else if (userDoc?.isPro === false || business?.isPro === false) {
      // Explicitly revoked by Admin Vault
      isProAccount = false;
      isTrialActive = false;
    } else if (business?.isPro === true || userDoc?.isPro === true || isTrialActive) {
      isProAccount = true;
    }

    if (business) {
      business.isPro = isProAccount;
      if (!isProAccount) {
        business.planName = "Unpaid";
        business.trialEndsAt = null;
      }
    }

    const catConfig = getCategoryById(business.category || "cafe");

    // Clean and normalize services
    let safeServices: any[] = [];
    if (Array.isArray(business.services) && business.services.length > 0) {
      safeServices = business.services
        .map((s: any, idx: number) => {
          const sName = typeof s === "string" ? s.trim() : (s?.name || "").trim();
          return sName ? { id: s?.id || `srv_${idx}`, name: sName } : null;
        })
        .filter(Boolean);
    }
    if (safeServices.length === 0) {
      safeServices = catConfig.defaultServices.map((name, idx) => ({ id: `srv_${idx}`, name }));
    }

    // Clean and normalize topics
    let safeTopics: any[] = [];
    if (Array.isArray(business.topics) && business.topics.length > 0) {
      safeTopics = business.topics
        .map((t: any, idx: number) => {
          const tName = typeof t === "string" ? t.trim() : (t?.name || "").trim();
          const tType = typeof t === "object" && t?.type === "issue" ? "issue" : "positive";
          return tName ? { id: t?.id || `top_${idx}`, name: tName, type: tType } : null;
        })
        .filter(Boolean);
    }
    if (safeTopics.length === 0) {
      safeTopics = [
        ...catConfig.positiveTopics.map((name, idx) => ({ id: `top_pos_${idx}`, name, type: "positive" })),
        ...catConfig.issueTopics.map((name, idx) => ({ id: `top_iss_${idx}`, name, type: "issue" })),
      ];
    }

    const isSuperAdmin = isFounderSuperAdmin;

    return NextResponse.json({
      success: true,
      isSuperAdmin,
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
        services: safeServices,
        topics: safeTopics,
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

    const body = await req.json();
    const { name, category, location, description, googleReviewUrl, brandColor, phone, services, topics } = body;

    // Fetch existing business first to lock slug and preserve assets
    let existingBusiness: any = null;
    if (session.businessSlug) {
      existingBusiness = await FirestoreDB.getBusinessBySlug(session.businessSlug).catch(() => null);
    }
    if (!existingBusiness && session.email) {
      const userDoc = await FirestoreDB.getUserByEmail(session.email).catch(() => null);
      if (userDoc?.businessSlug) {
        existingBusiness = await FirestoreDB.getBusinessBySlug(userDoc.businessSlug).catch(() => null);
      }
    }
    if (!existingBusiness) {
      existingBusiness = await FirestoreDB.getBusinessByUserId(session.userId).catch(() => null);
    }

    const effectiveSlug = existingBusiness?.slug || session.businessSlug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : `biz-${Date.now().toString(36)}`);

    // Sanitize services and topics
    const cleanServices = Array.isArray(services)
      ? services
          .map((s: any, idx: number) => {
            const sName = (typeof s === "string" ? s : s?.name || "").trim();
            return sName ? { id: s?.id || `srv_${idx}`, name: sName } : null;
          })
          .filter(Boolean)
      : (existingBusiness?.services || []);

    const cleanTopics = Array.isArray(topics)
      ? topics
          .map((t: any, idx: number) => {
            const tName = (typeof t === "string" ? t : t?.name || "").trim();
            const tType = typeof t === "object" && t?.type === "issue" ? "issue" : "positive";
            return tName ? { id: t?.id || `top_${idx}`, name: tName, type: tType } : null;
          })
          .filter(Boolean)
      : (existingBusiness?.topics || []);

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
            slug: effectiveSlug,
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
        for (const s of cleanServices) {
          await prisma.businessService.create({
            data: { businessId: updatedBusiness.id, name: s.name },
          });
        }
      }

      // Update topics if provided
      if (Array.isArray(topics) && updatedBusiness) {
        await prisma.businessTopic.deleteMany({ where: { businessId: updatedBusiness.id } });
        for (const t of cleanTopics) {
          await prisma.businessTopic.create({
            data: { businessId: updatedBusiness.id, name: t.name, type: t.type },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Prisma business update note:", dbErr);
    }

    // Sync with Firestore (preserving slug and existing metadata)
    const fsData = {
      ...(existingBusiness || {}),
      userId: session.userId,
      name: name || existingBusiness?.name || "My Business",
      slug: effectiveSlug,
      category: category || existingBusiness?.category || "cafe",
      location: location !== undefined ? location : existingBusiness?.location || "",
      description: description !== undefined ? description : existingBusiness?.description || "",
      googleReviewUrl: googleReviewUrl !== undefined ? googleReviewUrl : existingBusiness?.googleReviewUrl || "",
      brandColor: brandColor || existingBusiness?.brandColor || "#16A34A",
      phone: phone !== undefined ? phone : existingBusiness?.phone || "",
      services: cleanServices,
      topics: cleanTopics,
    };
    await FirestoreDB.saveBusiness(fsData).catch(() => {});

    // Ensure user document in Firestore is linked
    if (session.email) {
      try {
        const user = await FirestoreDB.getUserByEmail(session.email);
        if (user) {
          await FirestoreREST.setDocument("users", user.id, {
            ...user,
            businessSlug: effectiveSlug,
            businessName: fsData.name,
          });
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      business: {
        ...(updatedBusiness || {}),
        ...fsData,
        services: cleanServices,
        topics: cleanTopics,
      },
    });
  } catch (error: any) {
    console.error("PUT /api/business/me error:", error);
    return NextResponse.json({ success: false, error: "Failed to save business profile" }, { status: 500 });
  }
}
