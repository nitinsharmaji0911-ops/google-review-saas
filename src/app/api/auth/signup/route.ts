import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";
import { createSessionPayload, SESSION_COOKIE_NAME, hashPassword } from "@/lib/auth";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, "auth_signup", { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check existing in Prisma first, then Firestore
    let existing: any = null;
    try {
      existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch {}

    if (!existing) {
      existing = await FirestoreDB.getUserByEmail(normalizedEmail);
    }

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    let userId = "";

    // 1. Create in Prisma DB
    try {
      const newUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
        },
      });
      userId = newUser.id;
    } catch (dbErr) {
      console.warn("Prisma user create fallback:", dbErr);
    }

    // 2. Also record in Firestore
    if (!userId) {
      const fsUser = await FirestoreDB.createUser({
        email: normalizedEmail,
        password: hashedPassword,
      });
      userId = fsUser.id;
    } else {
      FirestoreDB.createUser({
        email: normalizedEmail,
        password: hashedPassword,
      }).catch(() => {});
    }

    const payload = createSessionPayload({
      userId,
      email: normalizedEmail,
    });

    const res = NextResponse.json({ success: true, redirect: "/onboarding" });
    res.cookies.set(SESSION_COOKIE_NAME, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to create account. Please try again." },
      { status: 500 }
    );
  }
}
