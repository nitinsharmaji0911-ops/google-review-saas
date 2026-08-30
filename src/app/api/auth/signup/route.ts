import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";
import { createSessionPayload, SESSION_COOKIE_NAME, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ success: false, error: "Valid email and password required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await FirestoreDB.getUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);
    const user = await FirestoreDB.createUser({
      email: normalizedEmail,
      password: hashedPassword,
    });

    const payload = createSessionPayload({
      userId: user.id,
      email: user.email,
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
