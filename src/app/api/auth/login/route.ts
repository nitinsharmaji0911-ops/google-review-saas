import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FirestoreDB, FirestoreREST } from "@/lib/firestore-db";
import { createSessionPayload, SESSION_COOKIE_NAME, verifyPassword, hashPassword } from "@/lib/auth";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, "auth_login", { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    const body = await req.json().catch(() => ({}));
    const { email, password, isDemo } = body;

    // Strict Production Check: Demo login bypass is permanently forbidden in production
    if (isDemo) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { success: false, error: "Demo authentication is disabled in production." },
          { status: 403 }
        );
      }

      // Local development only fixture
      const payload = createSessionPayload({
        userId: "demo-user-id",
        email: "owner@thecoffeehouse.com",
        businessId: "the-coffee-house-id",
        businessSlug: "the-coffee-house",
      });

      const res = NextResponse.json({ success: true, redirect: "/dashboard" });
      res.cookies.set(SESSION_COOKIE_NAME, payload, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Look up in Prisma database first
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { business: true },
      });
    } catch {}

    // Look up in Firestore if not found in Prisma
    if (!user) {
      try {
        user = await FirestoreDB.getUserByEmail(normalizedEmail);
      } catch {}
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 1. Verify password via local secure scrypt hash
    let isMatch = false;
    if (user.password) {
      isMatch = verifyPassword(password, user.password);
    }

    // 2. If not matched locally, verify with Firebase Authentication (e.g. after Firebase password reset)
    if (!isMatch) {
      try {
        const fbKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB7nnrGVSUxVTmKw4t6qXrBVxAGbxarVvE";
        const fbRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${fbKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: normalizedEmail,
              password,
              returnSecureToken: true,
            }),
          }
        );
        const fbData = await fbRes.json().catch(() => ({}));
        if (fbData && fbData.idToken) {
          isMatch = true;
          // Automatically sync local hash so future logins are instant
          const newHashedPassword = hashPassword(password);
          if (user.id) {
            await FirestoreREST.setDocument("users", user.id, {
              ...user,
              password: newHashedPassword,
              updatedAt: new Date().toISOString(),
            }).catch(() => {});
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: { password: newHashedPassword },
              });
            } catch {}
          }
        }
      } catch (fbErr) {
        console.warn("Firebase signin fallback note:", fbErr);
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let business = user.business;
    if (!business && user.id) {
      business = await FirestoreDB.getBusinessByUserId(user.id);
    }

    const businessSlug = business?.slug || user.businessSlug || "";
    const businessId = business?.id || user.businessId || undefined;

    const payload = createSessionPayload({
      userId: user.id,
      email: user.email,
      businessId,
      businessSlug: businessSlug || undefined,
    });

    const redirectPath = businessSlug ? "/dashboard" : "/onboarding";

    // Record login activity in Firestore for Super Admin audit log
    try {
      const loginTime = new Date().toISOString();
      const userAgent = req.headers.get("user-agent") || "unknown";

      if (user.id) {
        await FirestoreREST.setDocument("users", user.id, {
          ...user,
          lastLoginAt: loginTime,
          loginCount: (user.loginCount || 0) + 1,
          lastLoginProvider: "credentials",
        });
      }

      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await FirestoreREST.setDocument("login_logs", logId, {
        id: logId,
        userId: user.id,
        email: user.email,
        businessSlug: businessSlug || "",
        provider: "Email & Password",
        timestamp: loginTime,
        userAgent: userAgent.substring(0, 150),
      });
    } catch {}

    const res = NextResponse.json({
      success: true,
      redirect: redirectPath,
    });

    res.cookies.set(SESSION_COOKIE_NAME, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during sign in" },
      { status: 500 }
    );
  }
}
