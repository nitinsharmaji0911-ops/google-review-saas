"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  verifyPasswordResetCode as fbVerifyPasswordResetCode,
  confirmPasswordReset as fbConfirmPasswordReset,
  ActionCodeSettings,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "welurik-review.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "welurik-review",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

/**
 * Initializes and returns the Firebase Client Auth singleton instance
 */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (!app) {
      if (getApps().length === 0) {
        // Initialize if API key is provided, or initialize with config
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }
    }

    if (!auth && app) {
      auth = getAuth(app);
    }

    return auth || null;
  } catch (err) {
    console.warn("Firebase client auth initialization note:", err);
    return null;
  }
}

/**
 * Sends a password reset email using Firebase Authentication built-in service
 */
export async function sendFirebasePasswordReset(
  email: string,
  redirectUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authInstance = getFirebaseAuth();
    if (!authInstance || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      // If client API key is not in frontend bundle, delegate to backend Firebase Admin handler
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectUrl }),
      });
      const data = await res.json().catch(() => ({}));
      return { success: data.success !== false };
    }

    const actionCodeSettings: ActionCodeSettings = {
      url: redirectUrl || (typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "https://review.welurik.com/reset-password"),
      handleCodeInApp: true,
    };

    await fbSendPasswordResetEmail(authInstance, email.trim().toLowerCase(), actionCodeSettings);
    return { success: true };
  } catch (err: any) {
    const code = err.code || "";
    // Anti-enumeration: treat user-not-found as successful dispatch
    if (code === "auth/user-not-found" || code === "auth/invalid-email") {
      return { success: true };
    }
    if (code === "auth/too-many-requests") {
      return { success: false, error: "Too many requests. Please wait a while before trying again." };
    }
    if (code === "auth/network-request-failed") {
      return { success: false, error: "Something went wrong while sending the reset email. Please check your connection and try again." };
    }

    // Fallback to server route
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectUrl }),
      });
      const data = await res.json().catch(() => ({}));
      return { success: data.success !== false };
    } catch {
      return { success: true }; // Generic anti-enumeration response
    }
  }
}

/**
 * Verifies the password reset code sent by Firebase
 */
export async function verifyFirebaseResetCode(
  oobCode: string
): Promise<{ valid: boolean; email?: string; error?: string }> {
  try {
    const authInstance = getFirebaseAuth();
    if (!authInstance || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      // Validate via server endpoint
      const res = await fetch(`/api/auth/reset-password?code=${encodeURIComponent(oobCode)}`);
      const data = await res.json().catch(() => ({}));
      if (data.valid) {
        return { valid: true, email: data.email };
      }
      return { valid: false, error: "This password reset link is invalid or has expired." };
    }

    const email = await fbVerifyPasswordResetCode(authInstance, oobCode);
    return { valid: true, email };
  } catch {
    return { valid: false, error: "This password reset link is invalid or has expired." };
  }
}

/**
 * Confirms and updates the user's password with Firebase Authentication
 */
export async function confirmFirebasePasswordReset(
  oobCode: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authInstance = getFirebaseAuth();
    if (authInstance && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      await fbConfirmPasswordReset(authInstance, oobCode, newPassword);
    }

    // Also synchronize password update in backend database
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: oobCode, newPassword }),
    });

    const data = await res.json().catch(() => ({}));
    if (!data.success && !authInstance) {
      return { success: false, error: data.error || "This password reset link is invalid or has expired." };
    }

    return { success: true };
  } catch (err: any) {
    const code = err.code || "";
    if (code === "auth/expired-action-code" || code === "auth/invalid-action-code") {
      return { success: false, error: "This password reset link is invalid or has expired." };
    }
    if (code === "auth/weak-password") {
      return { success: false, error: "Password should be at least 6 characters." };
    }
    return { success: false, error: "Something went wrong while updating your password. Please try again." };
  }
}
