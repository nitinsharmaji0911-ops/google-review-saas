"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, CheckCircle2, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/onboarding");
      } else {
        setError(data.error || "Failed to create account");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Ambient Neon Glow Diffusion */}
      <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-300/20 via-indigo-200/25 to-purple-300/20 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[450px] h-[450px] bg-purple-200/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Simple Header */}
      <header className="max-w-6xl w-full mx-auto px-8 py-7 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-black text-2xl text-slate-950 tracking-tight">R</span>
          <span className="text-slate-300 font-light text-xl -mt-0.5">|</span>
          <span className="font-bold text-lg text-slate-950 tracking-tight">RevüAssist</span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full border border-slate-200/80 bg-white/80 hover:bg-slate-50 transition-all"
        >
          Sign In
        </Link>
      </header>

      {/* Centered Signup Container */}
      <main className="max-w-md w-full mx-auto px-6 py-6 my-auto z-10 space-y-6 text-center">
        {/* Logo Badge & Header */}
        <div className="space-y-2">
          <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-slate-900/10">
            R
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Claim Your Business License
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            One-time ₹1,999 • Lifetime Access • No Subscriptions
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[32px] p-7 sm:p-8 space-y-6 text-left shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          {/* Included Features Box */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> What's included with your license:
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Custom QR Standee & 4" x 6" Frame Studio</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>AI-Powered 30-Second Google Review Assistant</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Live Conversion Analytics & Feedback Inbox</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Email
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Start Business Setup <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 hover:underline inline-flex items-center gap-1"
            >
              Or explore the live demo dashboard →
            </Link>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-slate-900 hover:underline">
            Sign in here
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-8 py-6 text-center text-xs text-slate-400 z-10">
        © 2026 RevüAssist. 100% Google Policy Compliant.
      </footer>
    </div>
  );
}
