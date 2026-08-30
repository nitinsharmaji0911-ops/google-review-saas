import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "reviewboost_super_secret_production_key_2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Valid token and a password with at least 6 characters are required" },
        { status: 400 }
      );
    }

    // Decode and verify reset token
    let decoded: string;
    try {
      decoded = Buffer.from(token, "base64url").toString("utf-8");
    } catch {
      return NextResponse.json({ success: false, error: "Invalid or malformed reset token" }, { status: 400 });
    }

    const parts = decoded.split(":");
    if (parts.length !== 4) {
      return NextResponse.json({ success: false, error: "Invalid token structure" }, { status: 400 });
    }

    const [userId, email, expiryStr, signature] = parts;
    const expiry = parseInt(expiryStr, 10);

    if (Date.now() > expiry) {
      return NextResponse.json({ success: false, error: "Reset link has expired. Please request a new one." }, { status: 400 });
    }

    const tokenData = `${userId}:${email}:${expiryStr}`;
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(tokenData).digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, error: "Invalid token signature" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = hashPassword(newPassword);

    // 1. Update/Upsert in Prisma Database
    try {
      await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: { password: hashedPassword },
        create: { email: normalizedEmail, password: hashedPassword },
      });
    } catch (dbErr) {
      console.warn("Prisma user upsert note:", dbErr);
    }

    // 2. Update/Upsert in FirestoreDB
    try {
      let user = await FirestoreDB.getUserByEmail(normalizedEmail);
      if (user) {
        user.password = hashedPassword;
        const { firestore } = await import("@/lib/firebase").then((m) => m.getFirebaseAdmin());
        if (firestore && user.id) {
          await firestore.collection("users").doc(user.id).update({ password: hashedPassword });
        }
      } else {
        await FirestoreDB.createUser({ email: normalizedEmail, password: hashedPassword });
      }
    } catch (fsErr) {
      console.warn("Firestore user update note:", fsErr);
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now sign in with your new password.",
    });
  } catch (err: any) {
    console.error("Password reset error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
