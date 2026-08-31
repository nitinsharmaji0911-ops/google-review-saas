import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "review_saas_session";
const PROTECTED_ROUTES = ["/dashboard", "/settings", "/qr-studio", "/feedback", "/onboarding"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie || !sessionCookie.includes(".")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const [base64Data, signature] = sessionCookie.split(".");
    if (!base64Data || !signature) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const payload = JSON.parse(
      Buffer.from(base64Data, "base64url").toString("utf-8")
    );

    // Validate expiration
    if (payload.exp && Date.now() > payload.exp) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("expired", "1");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    if (!payload.userId) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/qr-studio/:path*",
    "/feedback/:path*",
    "/onboarding/:path*",
  ],
};
