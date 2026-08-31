import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";
import { createSessionPayload, SESSION_COOKIE_NAME, hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idToken, email: clientEmail, name, picture } = body;

    let email = clientEmail;
    let verifiedName = name || "";
    let verifiedPicture = picture || "";

    // 1. If an idToken is provided, verify with Google TokenInfo endpoint
    if (idToken && typeof idToken === "string") {
      try {
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (googleRes.ok) {
          const tokenInfo = await googleRes.json();
          if (tokenInfo && tokenInfo.email) {
            email = tokenInfo.email;
            verifiedName = tokenInfo.name || verifiedName;
            verifiedPicture = tokenInfo.picture || verifiedPicture;
          }
        }
      } catch (tokenErr) {
        console.warn("Google tokeninfo verification network error:", tokenErr);
      }
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid Google account email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Look up existing user in Prisma DB or Firestore
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { business: true },
      });
    } catch {}

    if (!user) {
      user = await FirestoreDB.getUserByEmail(normalizedEmail);
    }

    let userId = user?.id;

    // 3. If new user, create account automatically
    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const hashedPassword = hashPassword(randomPassword);

      try {
        const newUser = await prisma.user.create({
          data: {
            email: normalizedEmail,
            password: hashedPassword,
          },
        });
        userId = newUser.id;
        user = newUser;
      } catch (dbErr) {
        console.warn("Prisma user creation error:", dbErr);
      }

      if (!userId) {
        const fsUser = await FirestoreDB.createUser({
          email: normalizedEmail,
          password: hashedPassword,
        });
        userId = fsUser.id;
        user = fsUser;
      }
    }

    // 4. Determine business profile and redirect destination
    const businessSlug = user?.business?.slug || user?.businessSlug || "";
    const businessId = user?.business?.id || user?.businessId || undefined;

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
