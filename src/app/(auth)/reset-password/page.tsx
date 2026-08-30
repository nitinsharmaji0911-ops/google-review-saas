"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import WelurikLogo from "@/components/Logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[32px] p-7 sm:p-8 space-y-6 text-left shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      {!success ? (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium text-slate-900 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium text-slate-900 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-full text-xs font-bold shadow-[0_10px_20px_rgba(15,23,42,0.18)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Update Password <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-3 text-center py-2 animate-in fade-in">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Password Updated!</h3>
          <p className="text-xs text-slate-500">
            Your password has been changed securely. Redirecting to login...
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-300/20 via-indigo-200/25 to-purple-300/20 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto px-8 py-7 flex items-center justify-between z-10">
        <Link href="/" className="group hover:opacity-80 transition-opacity flex items-center">
          <WelurikLogo width={52} />
        </Link>
      </header>

      <main className="max-w-md w-full mx-auto px-6 py-6 my-auto z-10 space-y-6 text-center">
        <div className="space-y-2">
          <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Enter your new password below to secure your business account.
          </p>
        </div>

        <Suspense fallback={<div className="p-8 bg-white rounded-3xl animate-pulse" />}>
          <ResetPasswordForm />
        </Suspense>
      </main>

      <footer className="max-w-6xl w-full mx-auto px-8 py-6 text-center text-xs text-slate-400 z-10">
        © 2026 Welurik Review. All rights reserved.
      </footer>
    </div>
  );
}
