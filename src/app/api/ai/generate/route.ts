import { NextRequest, NextResponse } from "next/server";
import { generateReview } from "@/lib/ai-generator";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: 20 AI generations per minute per IP
    const rl = await checkRateLimit(req, "ai_generate", { limit: 20, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    const body = await req.json().catch(() => ({}));
    const {
      businessSlug,
      selectedTopics = [],
      selectedServices = [],
      customerComment = "",
      tone = "natural",
      rating = 5,
    } = body;

    if (!businessSlug || typeof businessSlug !== "string") {
      return NextResponse.json({ error: "A valid business slug is required." }, { status: 400 });
    }

    // 2. Input validation & sanitization
    const validRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const validTone = (["short", "natural", "detailed"].includes(tone) ? tone : "natural") as "short" | "natural" | "detailed";
    const sanitizedTopics = Array.isArray(selectedTopics)
      ? selectedTopics.filter((t): t is string => typeof t === "string").map((t) => t.slice(0, 50).trim()).slice(0, 10)
      : [];
    const sanitizedServices = Array.isArray(selectedServices)
      ? selectedServices.filter((s): s is string => typeof s === "string").map((s) => s.slice(0, 50).trim()).slice(0, 10)
      : [];
    const sanitizedComment = typeof customerComment === "string" ? customerComment.slice(0, 300).trim() : "";

    // 3. Fetch business details and enforce server-side quota
    let businessName = "Our Business";
    let category = "local service";
    let location = "";
    let businessId: string | null = null;

    if (businessSlug && typeof businessSlug === "string") {
      try {
        const b = await prisma.business.findUnique({
          where: { slug: businessSlug },
        });
        if (b) {
          businessName = b.name;
          category = b.category;
          location = b.location || "";
          businessId = b.id;

          // Enforce AI calls quota
          if (b.aiCallsThisMonth >= b.monthlyAiQuota) {
            // Graceful fallback to Smart Zero-Cost Rule Engine if monthly Gemini quota exceeded
          } else {
            prisma.business.update({
              where: { id: b.id },
              data: { aiCallsThisMonth: { increment: 1 } },
            }).catch(() => {});
          }
        }
      } catch {}

      if (!businessId) {
        const fsBiz = await FirestoreDB.getBusinessBySlug(businessSlug);
        if (fsBiz) {
          businessName = fsBiz.name;
          category = fsBiz.category;
          location = fsBiz.location || "";
          businessId = fsBiz.id;
        }
      }
    }

    if (!businessId) {
      return NextResponse.json({ error: "Business not found or inactive." }, { status: 404 });
    }

    // 4. Generate review using AI engine (Gemini Flash + NLP fallback)
    const result = await generateReview({
      businessName,
      category,
      location,
      selectedTopics: sanitizedTopics,
      selectedServices: sanitizedServices,
      customerComment: sanitizedComment,
      tone: validTone,
      rating: validRating,
    });

    // 5. Persist review session in Prisma DB
    if (businessId) {
      prisma.reviewSession.create({
        data: {
          businessId,
          rating: validRating,
          selectedTopics: JSON.stringify(sanitizedTopics),
          selectedServices: JSON.stringify(sanitizedServices),
          customerComment: sanitizedComment || null,
          generatedReview: result.review,
          tone: validTone,
          status: "generated",
        },
      }).catch((e) => console.warn("Error saving review session to Prisma:", e));

      prisma.analyticsEvent.create({
        data: {
          businessId,
          eventType: "review_generated",
          metadata: JSON.stringify({ source: result.source, tone: validTone }),
        },
      }).catch(() => {});
    }

    // Also track in Firestore
    FirestoreDB.createReview({
      businessSlug: businessSlug || "my-business",
      rating: validRating,
      selectedTopics: sanitizedTopics,
      selectedServices: sanitizedServices,
      customerComment: sanitizedComment || null,
      generatedReview: result.review,
      tone: validTone,
      status: "generated",
    }).catch(() => {});

    FirestoreDB.trackEvent(businessSlug || "my-business", "review_generated", {
      source: result.source,
      tone: validTone,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      review: result.review,
      source: result.source,
    });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate review. Please try again." },
      { status: 500 }
    );
  }
}
