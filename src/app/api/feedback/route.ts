import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessSlug, customerName, customerPhone, customerEmail, message, issueTopics } = body;

    if (!businessSlug || !message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const business = await FirestoreDB.getBusinessBySlug(businessSlug);
    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    const feedback = await FirestoreDB.createFeedback({
      businessSlug,
      customerName: customerName ? String(customerName).slice(0, 100) : null,
      customerPhone: customerPhone ? String(customerPhone).slice(0, 30) : null,
      customerEmail: customerEmail ? String(customerEmail).slice(0, 100) : null,
      message: message.slice(0, 1000).trim(),
      issueTopics: Array.isArray(issueTopics) ? issueTopics.slice(0, 10) : [],
    });

    // Track analytics event in Firestore
    await FirestoreDB.trackEvent(businessSlug, "feedback_submitted");

    return NextResponse.json({ success: true, feedbackId: feedback.id });
  } catch (err: any) {
    console.error("Feedback submission error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
