import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB, FirestoreREST } from "@/lib/firestore-db";
import { getSession } from "@/lib/auth";

// GET business by slug (Powered by Firebase Firestore)
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const business = await FirestoreDB.getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    const { phone: _, ...publicBusiness } = business;
    return NextResponse.json({ success: true, business: publicBusiness });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT update business settings (Powered by Firebase Firestore)
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, location, description, googleReviewUrl, brandColor, phone, services, topics } = body;

    const existing = await FirestoreDB.getBusinessBySlug(params.slug);

    // IDOR Protection: Verify session user owns this business
    if (existing && existing.userId && session.userId && existing.userId !== session.userId) {
      return NextResponse.json({ success: false, error: "Forbidden: You do not own this business" }, { status: 403 });
    }

    // Format services and topics for Firestore
    const formattedServices = Array.isArray(services)
      ? services
          .map((s, idx) => {
            const name = (typeof s === "string" ? s : s?.name || "").trim();
            return name ? { id: s?.id || `srv_${idx}`, name } : null;
          })
          .filter(Boolean)
      : existing?.services || [];

    const formattedTopics = Array.isArray(topics)
      ? topics
          .map((t, idx) => {
            const name = (typeof t === "string" ? t : t?.name || "").trim();
            const type = typeof t === "object" && t?.type === "issue" ? "issue" : "positive";
            return name ? { id: t?.id || `top_${idx}`, name, type } : null;
          })
          .filter(Boolean)
      : existing?.topics || [];

    const updated = await FirestoreDB.saveBusiness({
      ...(existing || {}),
      slug: params.slug,
      name: name !== undefined ? name : existing?.name || "My Business",
      category: category !== undefined ? category : existing?.category || "cafe",
      location: location !== undefined ? location : existing?.location || "",
      description: description !== undefined ? description : existing?.description || "",
      googleReviewUrl: googleReviewUrl !== undefined ? googleReviewUrl : existing?.googleReviewUrl || "",
      brandColor: brandColor !== undefined ? brandColor : existing?.brandColor || "#0f172a",
      phone: phone !== undefined ? phone : existing?.phone || "",
      services: formattedServices,
      topics: formattedTopics,
      userId: session.userId,
    });

    // Permanently link business to user in Firestore
    if (session.email) {
      const user = await FirestoreDB.getUserByEmail(session.email);
      if (user) {
        await FirestoreREST.setDocument("users", user.id, {
          ...user,
          businessSlug: params.slug,
          businessId: updated.id,
          businessName: updated.name,
        });
      }
    }

    return NextResponse.json({ success: true, business: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
