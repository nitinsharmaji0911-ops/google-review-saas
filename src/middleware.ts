import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "review_saas_session";
const PROTECTED_ROUTES = ["/dashboard", "/settings", "/qr-studio", "/feedback", "/onboarding", "/admin-vault", "/admin"];

async function verifyMiddlewareSession(sessionCookie: string): Promise<boolean> {
  try {
    if (!sessionCookie || !sessionCookie.includes(".")) return false;
    const dotIndex = sessionCookie.indexOf(".");
    const base64Data = sessionCookie.slice(0, dotIndex);
    const signature = sessionCookie.slice(dotIndex + 1);
    if (!base64Data || !signature) return false;

    // Web Crypto API HMAC verification (Edge Runtime compatible)
    const secret = process.env.JWT_SECRET || "dev_secret_key_only_for_local_testing_2026";
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const expectedSigBytes = await crypto.subtle.sign(
      "HMAC",
      keyMaterial,
      encoder.encode(base64Data)
    );

    // Convert base64url signature from cookie back to bytes
    const sigBase64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const sigBytes = Uint8Array.from(atob(sigBase64), (c) => c.charCodeAt(0));

    // Constant-time comparison
    if (expectedSigBytes.byteLength !== sigBytes.byteLength) return false;
    const expBytes = new Uint8Array(expectedSigBytes);
    let mismatch = 0;
    for (let i = 0; i < expBytes.length; i++) {
      mismatch |= expBytes[i] ^ sigBytes[i];
    }
    if (mismatch !== 0) return false;

    // Verify payload fields
    const payload = JSON.parse(atob(base64Data.replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.userId) return false;
    if (payload.exp && Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (!isProtected) return NextResponse.next();

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie || !(await verifyMiddlewareSession(sessionCookie))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/qr-studio/:path*",
    "/feedback/:path*",
    "/onboarding/:path*",
    "/admin-vault/:path*",
    "/admin/:path*",
  ],
};
