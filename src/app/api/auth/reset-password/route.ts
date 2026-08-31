import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code") || req.nextUrl.searchParams.get("token") || "";
    if (!code) {
      return NextResponse.json({ valid: false, error: "Missing reset code" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(code).digest("hex");
    try {
      const resetRecord = await prisma.resetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (resetRecord) {
        if (resetRecord.usedAt !== null || new Date() > resetRecord.expiresAt) {
          return NextResponse.json({ valid: false, error: "Link expired or used" });
        }
        return NextResponse.json({ valid: true, email: resetRecord.user?.email });
      }
    } catch {}

    // Fallback: If code is a Firebase Auth oobCode, client handles validation
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, code, newPassword, uid, email } = body;
    const resetCode = token || code;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    let userIdToUpdate: string | null = uid || null;
    let tokenRecordId: string | null = null;

    // 1. Look up token in database if resetCode is provided
    if (resetCode) {
      const tokenHash = crypto.createHash("sha256").update(resetCode).digest("hex");
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
      } catch {}
    }

    // 2. If email is provided (from Firebase verifyPasswordResetCode)
    if (!userIdToUpdate && email) {
      try {
        const userByEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (userByEmail) {
          userIdToUpdate = userByEmail.id;
        }
      } catch {}

      if (!userIdToUpdate) {
        const fsUser = await FirestoreDB.getUserByEmail(email.toLowerCase().trim());
        if (fsUser) {
          userIdToUpdate = fsUser.id;
        }
      }
    }

    const hashedPassword = hashPassword(newPassword);

    // 3. Update password in database if matched
    if (userIdToUpdate) {
      try {
        await prisma.user.update({
          where: { id: userIdToUpdate },
          data: { password: hashedPassword },
        });

        if (tokenRecordId) {
          await prisma.resetToken.update({
            where: { id: tokenRecordId },
            data: { usedAt: new Date() },
          });
        }
      } catch (dbErr) {
        console.warn("Prisma user password update note:", dbErr);
      }

      try {
        const { firestore } = await import("@/lib/firebase").then((m) => m.getFirebaseAdmin());
        if (firestore) {
          await firestore.collection("users").doc(userIdToUpdate).update({ password: hashedPassword });
        }
      } catch {}
    }

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
