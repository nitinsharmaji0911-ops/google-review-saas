import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "reviewboost_super_secret_production_key_2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Valid email required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await FirestoreDB.getUserByEmail(normalizedEmail);

    // Cryptographic reset token with 1-hour expiry
    const expiry = Date.now() + 1000 * 60 * 60; // 1 hour
    const userId = user?.id || "anonymous";
    const tokenData = `${userId}:${normalizedEmail}:${expiry}`;
    const tokenSignature = crypto.createHmac("sha256", SECRET).update(tokenData).digest("hex");
    const resetToken = Buffer.from(`${tokenData}:${tokenSignature}`).toString("base64url");

    const origin = req.nextUrl.origin || "http://localhost:3000";
    const resetLink = `${origin}/reset-password?token=${resetToken}`;

    // Send the real email through Nodemailer (Gmail / SMTP / Ethereal)
    const emailResult = await sendPasswordResetEmail({
      to: normalizedEmail,
      resetLink,
    });

    return NextResponse.json({
      success: true,
      message: "We've sent a password reset confirmation link to your email.",
      emailPreviewUrl: emailResult.previewUrl,
      resetLink,
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
