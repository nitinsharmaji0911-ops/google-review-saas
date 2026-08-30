"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2, ChevronLeft, ExternalLink, Sparkles } from "lucide-react";
import WelurikLogo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        if (data.emailPreviewUrl) setEmailPreviewUrl(data.emailPreviewUrl);
        if (data.resetLink) setResetLink(data.resetLink);
      } else {
        setError(data.error || "Failed to send reset link");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Ambient Glow Diffusion */}
      <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-300/20 via-indigo-200/25 to-purple-300/20 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[450px] h-[450px] bg-purple-200/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto px-8 py-7 flex items-center justify-between z-10">
        <Link href="/" className="group hover:opacity-85 transition-opacity">
          <WelurikLogo width={160} />
        </Link>
        <Link
          href="/login"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full border border-slate-200/80 bg-white/80 hover:bg-slate-50 transition-all flex items-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto px-6 py-6 my-auto z-10 space-y-6 text-center">
        <div className="space-y-2">
          <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Enter your email and we'll send you an instant reset confirmation link.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[32px] p-7 sm:p-8 space-y-6 text-left shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourbusiness.com"
                    className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium text-slate-900 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-full text-xs font-bold shadow-[0_10px_20px_rgba(15,23,42,0.18)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Link to Email <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Email Dispatched! ✉️</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We've sent a password reset confirmation email to <span className="font-semibold text-slate-900">{email}</span>.
                </p>
              </div>

              {/* Live Email View Button */}
              {emailPreviewUrl && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Live Delivered Email:
                    </span>
                    <a
                      href={emailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs"
                    >
                      Open Email <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[10px] text-indigo-700 leading-relaxed">
                    Click "Open Email" to view the HTML email in your browser.
                  </p>
                </div>
              )}

              {resetLink && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Direct Reset Link:
                  </span>
                  <Link
                    href={resetLink}
                    className="text-xs font-semibold text-slate-900 hover:underline block break-all"
                  >
                    {resetLink}
                  </Link>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Didn't receive the email? Try again
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-slate-900 hover:underline">
            Sign in here
          </Link>
        </p>
      </main>

      <footer className="max-w-6xl w-full mx-auto px-8 py-6 text-center text-xs text-slate-400 z-10">
        © 2026 Welurik Review. All rights reserved.
      </footer>
    </div>
  );
}
