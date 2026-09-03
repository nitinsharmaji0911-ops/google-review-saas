"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import WelurikLogo from "@/components/Logo";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem("welurik_dashboard_cache");
          } catch {}
        }
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const fromRoute = params?.get("from");
        window.location.href = fromRoute || data.redirect || "/dashboard";
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch {
      setError("Unable to connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECFDF5] neo-canvas-bg text-black font-sans selection:bg-black selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Top Brand Header */}
      <header className="max-w-6xl w-full mx-auto px-6 sm:px-8 py-6 flex items-center justify-between z-10">
        <Link href="/" className="group hover:opacity-80 transition-opacity flex items-center">
          <WelurikLogo className="h-9 sm:h-[48px]" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">New to Welurik?</span>
          <Link
            href="/signup"
            className="text-xs font-black text-black px-4 py-2 rounded-full border-2 border-black bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="max-w-[440px] w-full mx-auto px-4 sm:px-6 py-6 my-auto z-10 space-y-5 text-center">
        {/* Title Header */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Sign In to Welurik
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-600 font-medium">
            Manage your QR standees, AI review prompts & analytics
          </p>
        </div>

        {/* Neo-brutalist Main Card */}
        <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 space-y-5 text-left shadow-[5px_5px_0px_#000000]">
          {error && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs font-bold rounded-2xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Google Sign-In */}
          <div className="space-y-3">
            <GoogleAuthButton
              text="Continue with Google"
              onError={(err) => setError(err)}
              onSuccess={() => setError("")}
            />

            {/* Clean Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t-2 border-black/10 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                or sign in with email
              </span>
              <div className="border-t-2 border-black/10 w-full" />
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-black mb-1.5">
                Business Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourbusiness.com"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-slate-50 border-2 border-black rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-bold text-black shadow-[2px_2px_0px_#000000] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-black">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-slate-600 hover:text-black transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 bg-slate-50 border-2 border-black rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-bold text-black shadow-[2px_2px_0px_#000000] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 bg-[#15803D] hover:bg-[#166534] disabled:bg-slate-300 text-white rounded-full text-xs sm:text-sm font-black border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Sign-Up Link */}
        <p className="text-xs text-slate-500 font-medium">
          Don't have an account yet?{" "}
          <Link href="/signup" className="font-bold text-black underline decoration-2 hover:text-[#15803D]">
            Claim ₹1,999 only Lifetime License
          </Link>
        </p>
      </main>

      {/* Modern Minimal Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-6 text-center text-xs text-slate-500 font-medium z-10 flex flex-wrap items-center justify-center gap-4 border-t-2 border-black/10">
        <span>© 2026 Welurik Review. All rights reserved.</span>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-black">Terms of Service</Link>
          <span>•</span>
          <Link href="/refund" className="hover:text-black">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
