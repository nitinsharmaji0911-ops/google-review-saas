import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FirestoreDB, FirestoreREST } from "@/lib/firestore-db";
import { createSessionPayload, SESSION_COOKIE_NAME, hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idToken, name, picture } = body;

    let email = "";
    let verifiedName = name || "";
    let verifiedPicture = picture || "";

    // SECURITY: Always require idToken — never trust raw email from request body
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid Google ID token is required." },
        { status: 401 }
      );
    }

    try {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!googleRes.ok) {
        return NextResponse.json({ success: false, error: "Google token verification failed." }, { status: 401 });
      }
      const tokenInfo = await googleRes.json();
      if (!tokenInfo?.email) {
        return NextResponse.json({ success: false, error: "Could not retrieve email from Google token." }, { status: 401 });
      }
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (clientId && tokenInfo.aud && tokenInfo.aud !== clientId) {
        return NextResponse.json({ success: false, error: "Token audience mismatch." }, { status: 401 });
      }
      email = tokenInfo.email;
      verifiedName = tokenInfo.name || verifiedName;
      verifiedPicture = tokenInfo.picture || verifiedPicture;
    } catch (tokenErr) {
      console.error("Google tokeninfo error:", tokenErr);
      return NextResponse.json({ success: false, error: "Google token verification failed." }, { status: 401 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid Google account email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 3. Look up existing user in Firestore
    let user = await FirestoreDB.getUserByEmail(normalizedEmail);
    let userId = user?.id;

    // 4. If new user, create account automatically in Firestore
    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const hashedPassword = hashPassword(randomPassword);

      const fsUser = await FirestoreDB.createUser({
        email: normalizedEmail,
        password: hashedPassword,
      });
      userId = fsUser.id;
      user = fsUser;
    }

    // 5. Look up existing business
    let business = user?.business;
    if (!business && user?.businessSlug) {
      business = await FirestoreDB.getBusinessBySlug(user.businessSlug);
    }
    if (!business && userId) {
      business = await FirestoreDB.getBusinessByUserId(userId);
    }

    if (!business && (normalizedEmail === "nitin.sharmaji2405@gmail.com" || normalizedEmail === "owner@thecoffeehouse.com")) {
      business = await FirestoreDB.getBusinessBySlug("the-coffee-house");
    }

    // Check if a business exists under the email prefix slug
    if (!business) {
      const emailSlug = normalizedEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
      business = await FirestoreDB.getBusinessBySlug(emailSlug);
    }

    const businessSlug = business?.slug || user?.businessSlug || "";
    const businessId = business?.id || user?.businessId || undefined;

    // Permanently link business on user profile
    if (business && (!user?.businessSlug || user.businessSlug !== businessSlug)) {
      await FirestoreREST.setDocument("users", user.id, {
        ...user,
        businessSlug,
        businessId,
      });
    }

    const payload = createSessionPayload({
      userId: userId || user.id,
      email: normalizedEmail,
      businessId,
      businessSlug: businessSlug || undefined,
    });

    const redirectPath = businessSlug ? "/dashboard" : "/onboarding";

    const res = NextResponse.json({
      success: true,
      redirect: redirectPath,
      user: {
        id: userId,
        email: normalizedEmail,
        name: verifiedName,
        picture: verifiedPicture,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (err: any) {
    console.error("Google Auth Route Error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during Google sign-in." },
      { status: 500 }
    );
  }
}
