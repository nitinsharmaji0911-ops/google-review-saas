import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";
import { prisma } from "@/lib/db";
import { createSessionPayload, SESSION_COOKIE_NAME, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, isDemo } = body;

    // Fast 1-click demo button bypass
    if (isDemo) {
      const payload = createSessionPayload({
        userId: "demo-user-id",
        email: "owner@thecoffeehouse.com",
        businessId: "the-coffee-house-id",
        businessSlug: "the-coffee-house",
      });

      const res = NextResponse.json({ success: true, redirect: "/dashboard" });
      res.cookies.set(SESSION_COOKIE_NAME, payload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Look up in Prisma first, then FirestoreDB
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { business: true },
      });
    } catch {
      // fallback
    }

    if (!user) {
      user = await FirestoreDB.getUserByEmail(normalizedEmail);
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    // Check password (supports hashed password and plain legacy)
    const isMatch = verifyPassword(password, user.password) || user.password === password;
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const businessSlug = user.business?.slug || user.businessSlug || "the-coffee-house";

    const payload = createSessionPayload({
      userId: user.id,
      email: user.email,
      businessId: user.business?.id,
      businessSlug,
    });

    const res = NextResponse.json({
      success: true,
      redirect: "/dashboard",
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
