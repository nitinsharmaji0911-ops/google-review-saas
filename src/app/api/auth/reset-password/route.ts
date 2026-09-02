import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FirestoreDB } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code") || req.nextUrl.searchParams.get("token") || "";
    if (!code) {
      return NextResponse.json({ valid: false, error: "Missing reset code" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(code).digest("hex");

    // 1. Check in Prisma
    try {
      const resetRecord = await prisma.resetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (resetRecord) {
        if (resetRecord.usedAt !== null || new Date() > resetRecord.expiresAt) {
          return NextResponse.json({ valid: false, error: "Link expired or already used" }, { status: 400 });
        }
        return NextResponse.json({ valid: true, email: resetRecord.user?.email });
      }
    } catch {}

    // 2. Check in Firestore
    try {
      const fsToken = await FirestoreREST.getDocument("reset_tokens", tokenHash);
      if (fsToken) {
        if (fsToken.usedAt || (fsToken.expiresAt && new Date(fsToken.expiresAt).getTime() < Date.now())) {
          return NextResponse.json({ valid: false, error: "Link expired or already used" }, { status: 400 });
        }
        return NextResponse.json({ valid: true, email: fsToken.email });
      }
    } catch {}

    return NextResponse.json({ valid: false, error: "Invalid reset link" }, { status: 400 });
  } catch {
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, code, newPassword } = body;
    const resetCode = token || code;

    // STRICT SECURITY: A valid reset token is MANDATORY. No unverified email updates permitted!
    if (!resetCode || typeof resetCode !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid password reset token is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(resetCode).digest("hex");
    let userIdToUpdate: string | null = null;
    let userEmail: string | null = null;
    let tokenRecordId: string | null = null;
    let isFsToken = false;

    // 1. Verify token in Prisma
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
        userEmail = resetRecord.user?.email || null;
        tokenRecordId = resetRecord.id;
      }
    } catch {}

    // 2. Verify token in Firestore fallback
    if (!userIdToUpdate) {
      try {
        const fsToken = await FirestoreREST.getDocument("reset_tokens", tokenHash);
        if (fsToken) {
          if (fsToken.usedAt) {
            return NextResponse.json(
              { success: false, error: "This password reset link has already been used. Please request a new one." },
              { status: 400 }
            );
          }

          if (fsToken.expiresAt && new Date(fsToken.expiresAt).getTime() < Date.now()) {
            return NextResponse.json(
              { success: false, error: "This password reset link has expired. Please request a new one." },
              { status: 400 }
            );
          }

          userIdToUpdate = fsToken.userId;
          userEmail = fsToken.email || null;
          isFsToken = true;
        }
      } catch {}
    }

    // STRICT REJECTION: If token wasn't found or validated, abort!
    if (!userIdToUpdate) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(newPassword);

    // 3. Update password in Prisma
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

    // 4. Update password in Firestore
    try {
      let fsUser = userEmail ? await FirestoreDB.getUserByEmail(userEmail) : null;
      const targetDocId = fsUser?.id || userIdToUpdate;
      if (fsUser) {
        await FirestoreREST.setDocument("users", targetDocId, {
          ...fsUser,
          password: hashedPassword,
          updatedAt: new Date().toISOString(),
        });
      }

      // Mark token as used in Firestore
      await FirestoreREST.setDocument("reset_tokens", tokenHash, {
        tokenHash,
        userId: userIdToUpdate,
        usedAt: new Date().toISOString(),
      });
    } catch (fsErr) {
      console.warn("Firestore password update note:", fsErr);
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
