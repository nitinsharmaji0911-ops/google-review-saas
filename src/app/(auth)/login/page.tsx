"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import WelurikLogo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@thecoffeehouse.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Ambient Neon Glow Diffusion */}
      <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-300/20 via-indigo-200/25 to-purple-300/20 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[450px] h-[450px] bg-purple-200/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Simple Header */}
      <header className="max-w-6xl w-full mx-auto px-8 py-7 flex items-center justify-between z-10">
        <Link href="/" className="group hover:opacity-80 transition-opacity">
          <WelurikLogo width={34} />
        </Link>
        <Link
          href="/signup"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full border border-slate-200/80 bg-white/80 hover:bg-slate-50 transition-all"
        >
          Create Account
        </Link>
      </header>

      {/* Centered Login Container */}
      <main className="max-w-md w-full mx-auto px-6 py-6 my-auto z-10 space-y-6 text-center">
        {/* Logo Badge & Header */}
        <div className="space-y-2">
          <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-slate-900/10">
            R
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to manage your Google reviews & QR standees
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[32px] p-7 sm:p-8 space-y-6 text-left shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-950 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
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
                  Sign In to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Instant Demo Button */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo Login (The Coffee House)
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Don't have an account yet?{" "}
          <Link href="/signup" className="font-semibold text-slate-900 hover:underline">
            Claim lifetime access
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-8 py-6 text-center text-xs text-slate-400 z-10">
        © 2026 Welurik Review. 100% Google policy compliant.
      </footer>
    </div>
  );
}
