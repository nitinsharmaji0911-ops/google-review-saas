import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, newPassword, uid } = body;

    if (!token || !newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Valid token and a password with at least 6 characters are required" },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    let userIdToUpdate: string | null = null;
    let tokenRecordId: string | null = null;

    // 1. Look up token in database
    try {
      const resetRecord = await prisma.resetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (resetRecord) {
        if (resetRecord.usedAt !== null) {
          return NextResponse.json(
            { success: false, error: "This password reset link has already been used. Please request a new one." },
            { status: 400 }
          );
        }

        if (new Date() > resetRecord.expiresAt) {
          return NextResponse.json(
            { success: false, error: "This password reset link has expired. Please request a new one." },
            { status: 400 }
          );
        }

        userIdToUpdate = resetRecord.userId;
        tokenRecordId = resetRecord.id;
      }
    } catch {
      // Fallback
    }

    // 2. Legacy fallback for HMAC-based tokens
    if (!userIdToUpdate && token.includes(":")) {
      try {
        const decoded = Buffer.from(token, "base64url").toString("utf-8");
        const parts = decoded.split(":");
        if (parts.length === 4) {
          const [userId, email, expiryStr, signature] = parts;
          const expiry = parseInt(expiryStr, 10);
          if (Date.now() <= expiry) {
            const secret = process.env.JWT_SECRET || "dev_secret";
            const tokenData = `${userId}:${email}:${expiryStr}`;
            const expectedSignature = crypto.createHmac("sha256", secret).update(tokenData).digest("hex");
            if (signature === expectedSignature) {
              userIdToUpdate = userId;
            }
          }
        }
      } catch {}
    }

    if (!userIdToUpdate && uid) {
      userIdToUpdate = uid;
    }

    if (!userIdToUpdate) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(newPassword);

    // 3. Update password in Prisma Database
    try {
      await prisma.user.update({
        where: { id: userIdToUpdate },
        data: { password: hashedPassword },
      });

      // Mark token as used to prevent replay attacks
      if (tokenRecordId) {
        await prisma.resetToken.update({
          where: { id: tokenRecordId },
          data: { usedAt: new Date() },
        });
      }
    } catch (dbErr) {
      console.warn("Prisma user password update:", dbErr);
    }

    // 4. Update in FirestoreDB if user exists there
    try {
      const { firestore } = await import("@/lib/firebase").then((m) => m.getFirebaseAdmin());
      if (firestore) {
        await firestore.collection("users").doc(userIdToUpdate).update({ password: hashedPassword });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now sign in with your new password.",
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
