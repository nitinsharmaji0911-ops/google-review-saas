import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";
import { createSessionPayload, SESSION_COOKIE_NAME, verifyPassword } from "@/lib/auth";
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
    } catch {
      // Fallback
    }

    if (!user) {
      user = await FirestoreDB.getUserByEmail(normalizedEmail);
    }

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // STRICT SECURITY: Verify password solely via secure timing-safe cryptographic scrypt hash
    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const businessSlug = user.business?.slug || user.businessSlug || "";

    const payload = createSessionPayload({
      userId: user.id,
      email: user.email,
      businessId: user.business?.id,
      businessSlug: businessSlug || undefined,
    });

    const redirectPath = businessSlug ? "/dashboard" : "/onboarding";
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
