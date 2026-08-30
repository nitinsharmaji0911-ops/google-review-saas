import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSessionPayload, SESSION_COOKIE_NAME, verifyPassword, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, isDemo } = body;

    // Fast demo login path
    if (isDemo || email === "demo@thecoffeehouse.com" || email === "owner@thecoffeehouse.com") {
      const demoBiz = await prisma.business.findFirst({
        where: { slug: "the-coffee-house" },
        include: { user: true },
      });

      if (demoBiz && demoBiz.user) {
        const payload = createSessionPayload({
          userId: demoBiz.user.id,
          email: demoBiz.user.email,
          businessId: demoBiz.id,
          businessSlug: demoBiz.slug,
        });

        const res = NextResponse.json({ success: true, redirect: "/dashboard" });
        res.cookies.set(SESSION_COOKIE_NAME, payload, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        return res;
      }
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { business: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    // Check password (supports hashed or legacy plain for demo accounts)
    const isMatch = verifyPassword(password, user.password) || user.password === password;
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const payload = createSessionPayload({
      userId: user.id,
      email: user.email,
      businessId: user.business?.id,
      businessSlug: user.business?.slug,
    });

    const res = NextResponse.json({
      success: true,
      redirect: user.business ? "/dashboard" : "/onboarding",
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
