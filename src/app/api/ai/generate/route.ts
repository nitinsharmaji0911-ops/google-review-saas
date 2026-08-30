import { NextRequest, NextResponse } from "next/server";
import { generateReview } from "@/lib/ai-generator";
import { FirestoreDB } from "@/lib/firestore-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessSlug,
      selectedTopics = [],
      selectedServices = [],
      customerComment = "",
      tone = "natural",
      rating = 5,
    } = body;

    // Input validation & sanitization
    const validRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const validTone = (["short", "natural", "detailed"].includes(tone) ? tone : "natural") as "short" | "natural" | "detailed";
    const sanitizedTopics = Array.isArray(selectedTopics)
      ? selectedTopics.filter((t): t is string => typeof t === "string").map((t) => t.slice(0, 50).trim()).slice(0, 10)
      : [];
    const sanitizedServices = Array.isArray(selectedServices)
      ? selectedServices.filter((s): s is string => typeof s === "string").map((s) => s.slice(0, 50).trim()).slice(0, 10)
      : [];
    const sanitizedComment = typeof customerComment === "string" ? customerComment.slice(0, 300).trim() : "";

    // Fetch business details from FirestoreDB
    let businessName = "Our Business";
    let category = "local service";
    let location = "";

    if (businessSlug && typeof businessSlug === "string") {
      const b = await FirestoreDB.getBusinessBySlug(businessSlug);
      if (b) {
        businessName = b.name;
        category = b.category;
        location = b.location || "";
      }
    }

    // Generate review using AI / Smart Engine
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

    // Record review session in Firestore asynchronously
    FirestoreDB.createReview({
      businessSlug: businessSlug || "the-coffee-house",
      rating: validRating,
      selectedTopics: sanitizedTopics,
      selectedServices: sanitizedServices,
      customerComment: sanitizedComment || null,
      generatedReview: result.review,
      tone: validTone,
      status: "generated",
    }).catch((e) => console.error("Error saving review session:", e));

    // Track analytics event in Firestore
    FirestoreDB.trackEvent(businessSlug || "the-coffee-house", "review_generated", {
      source: result.source,
      tone: validTone,
    }).catch((e) => console.error("Error tracking event:", e));

    return NextResponse.json({
      success: true,
      review: result.review,
      source: result.source,
    });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate review" },
      { status: 500 }
    );
  }
}
