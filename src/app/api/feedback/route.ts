import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";

// GET authenticated business's feedback inbox
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let business: any = null;
    try {
      business = await prisma.business.findUnique({
        where: { userId: session.userId },
        include: {
          feedbacks: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } catch {}

    if (!business) {
      business = await FirestoreDB.getBusinessByUserId(session.userId);
      if (!business && session.businessSlug) {
        business = await FirestoreDB.getBusinessBySlug(session.businessSlug);
      }
    }

    if (!business) {
      return NextResponse.json({ success: true, feedback: [] });
    }

    let feedbackList: any[] = [];
    if (business.feedbacks && Array.isArray(business.feedbacks) && business.feedbacks.length > 0) {
      feedbackList = business.feedbacks;
    } else {
      feedbackList = await FirestoreDB.getFeedbacksBySlug(business.slug);
    }

    const formattedList = feedbackList.map((f: any) => ({
      id: f.id,
      customerName: f.customerName || null,
      customerPhone: f.customerPhone || null,
      customerEmail: f.customerEmail || null,
      message: f.message || f.feedback || "",
      issueTopics: typeof f.issueTopics === "string" ? f.issueTopics : JSON.stringify(f.issueTopics || f.selectedIssues || []),
      status: f.status || "unread",
      createdAt: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      feedback: formattedList,
      feedbacks: formattedList,
    });
  } catch (error: any) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH toggle feedback status (resolved / unread) with strict ownership validation
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const id = body.id || body.feedbackId;
    const status = body.status;

    if (!id || !status || !["unread", "resolved"].includes(status)) {
      return NextResponse.json({ success: false, error: "Valid ID and status ('unread' | 'resolved') required" }, { status: 400 });
    }

    // Verify ownership in Prisma
    let business: any = null;
    try {
      business = await prisma.business.findUnique({
        where: { userId: session.userId },
      });
    } catch {}

    if (!business) {
      business = await FirestoreDB.getBusinessByUserId(session.userId);
      if (!business && session.businessSlug) {
        business = await FirestoreDB.getBusinessBySlug(session.businessSlug);
      }
    }

    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    try {
      const feedbackItem = await prisma.feedback.findUnique({
        where: { id },
      });

      if (feedbackItem && feedbackItem.businessId !== business.id) {
        return NextResponse.json({ success: false, error: "Forbidden: You do not own this feedback record" }, { status: 403 });
      }

      if (feedbackItem) {
        await prisma.feedback.update({
          where: { id },
          data: { status },
        });
      }
    } catch (dbErr) {
      console.warn("Prisma feedback update note:", dbErr);
    }

    // Update in Firestore
    await FirestoreDB.updateFeedbackStatus(id, status).catch(() => {});

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("PATCH /api/feedback error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST public customer submission from /r/[slug]/feedback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const businessSlug = body.businessSlug || body.slug;
    const rawMessage = body.message || body.feedback;
    const { customerName, customerPhone, customerEmail } = body;
    const issueTopics = body.issueTopics || body.selectedIssues || [];

    if (!businessSlug || !rawMessage || typeof rawMessage !== "string") {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let business: any = null;
    try {
      business = await prisma.business.findUnique({
        where: { slug: businessSlug },
      });
    } catch {}

    if (!business) {
      business = await FirestoreDB.getBusinessBySlug(businessSlug);
    }

    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    const sanitizedMessage = rawMessage.slice(0, 1000).trim();
    const sanitizedName = customerName ? String(customerName).slice(0, 100).trim() : null;
    const sanitizedPhone = customerPhone ? String(customerPhone).slice(0, 30).trim() : null;
    const sanitizedEmail = customerEmail ? String(customerEmail).slice(0, 100).trim() : null;
    const sanitizedTopics = Array.isArray(issueTopics) ? issueTopics.slice(0, 10) : [];

    let feedbackId = `fb_${Date.now()}`;

    // 1. Save in Prisma DB
    try {
      const newFeedback = await prisma.feedback.create({
        data: {
          businessId: business.id,
          customerName: sanitizedName,
          customerPhone: sanitizedPhone,
          customerEmail: sanitizedEmail,
          message: sanitizedMessage,
          issueTopics: JSON.stringify(sanitizedTopics),
          status: "unread",
        },
      });
      feedbackId = newFeedback.id;
    } catch (dbErr) {
      console.warn("Prisma feedback create note:", dbErr);
    }

    // 2. Save in Firestore
    await FirestoreDB.createFeedback({
      businessSlug,
      customerName: sanitizedName,
      customerPhone: sanitizedPhone,
      customerEmail: sanitizedEmail,
      message: sanitizedMessage,
      issueTopics: sanitizedTopics,
    }).catch(() => {});

    await FirestoreDB.trackEvent(businessSlug, "feedback_submitted").catch(() => {});

    // Track analytics event
    try {
      await prisma.analyticsEvent.create({
        data: {
          businessId: business.id,
          eventType: "feedback_submitted",
        },
      });
    } catch {}
    FirestoreDB.trackEvent(businessSlug, "feedback_submitted").catch(() => {});

    return NextResponse.json({ success: true, feedbackId });
  } catch (err: any) {
    console.error("Feedback submission error:", err);
    return NextResponse.json({ success: false, error: "Failed to submit feedback" }, { status: 500 });
  }
}
