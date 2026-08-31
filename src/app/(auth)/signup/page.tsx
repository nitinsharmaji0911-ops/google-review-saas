"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sparkles, ArrowRight, Lock, Mail, CheckCircle2, ShieldCheck, Zap, Loader2 } from "lucide-react";
import WelurikLogo from "@/components/Logo";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSignupAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setLoadingStep("Creating your business account...");

    try {
      // Step 1: Create Account
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const signupData = await signupRes.json();
      if (!signupData.success) {
        throw new Error(signupData.error || "Failed to create account");
      }

      // Step 2: Initialize Razorpay Order
      setLoadingStep("Connecting secure payment gateway...");
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: "lifetime", email }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Could not initialize checkout order");
      }

      // If Razorpay API keys are not added yet (demo / mock mode)
      if (orderData.isMock || !orderData.keyId || orderData.keyId === "rzp_test_placeholder") {
        setLoadingStep("Activating your lifetime license...");
        setTimeout(async () => {
          await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `pay_demo_${Date.now().toString().slice(-6)}`,
              razorpay_signature: `mock_sig_${Date.now()}`,
              planType: "lifetime",
            }),
          });
          router.push(`/checkout/success?order_id=${orderData.orderId}&payment_id=pay_demo_success`);
        }, 900);
        return;
      }

      // Step 3: Load SDK and open Razorpay Gateway
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load secure Razorpay gateway. Please check your internet connection.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Welurik Review",
        description: "₹1,999 Lifetime License",
        image: "/favicon.png",
        order_id: orderData.orderId,
        prefill: {
          email: email,
        },
        theme: {
          color: "#16A34A",
        },
        handler: async function (response: any) {
          try {
            setLoading(true);
            setLoadingStep("Verifying transaction & activating license...");
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || `mock_sig_${Date.now()}`,
                planType: "lifetime",
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              router.push(`/checkout/success?order_id=${verifyData.orderId || orderData.orderId}&payment_id=${response.razorpay_payment_id}`);
            } else {
              router.push("/onboarding");
            }
          } catch {
            router.push("/onboarding");
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            // If user cancels payment popup, take them to onboarding where they can also activate
            router.push("/onboarding");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error?.description || "Payment was not completed. You can complete it in your dashboard.");
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong during signup");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Ambient Neon Glow Diffusion */}
      <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-green-300/15 via-emerald-200/20 to-teal-300/15 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[450px] h-[450px] bg-green-200/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto px-8 py-7 flex items-center justify-between z-10">
        <Link href="/" className="group hover:opacity-80 transition-opacity flex items-center">
          <WelurikLogo className="h-10 sm:h-[56px]" />
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
        {/* Monogram Icon & Title */}
        <div className="space-y-2">
          <div className="w-14 h-14 bg-[#16A34A] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-green-600/20 overflow-hidden border-2 border-white">
            <Image
              src="/icon.png"
              alt="Welurik Review"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
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
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100/80 space-y-2">
            <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> What's included with your license:
            </span>
            <ul className="space-y-1.5 text-[11px] text-emerald-900/80">
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
          <form onSubmit={handleSignupAndPay} className="space-y-4">
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
                  className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 font-medium text-slate-900 transition-all"
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
                  className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 font-medium text-slate-900 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#16A34A] hover:bg-[#15803D] disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold shadow-lg shadow-green-600/25 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || "Processing..."}</span>
                </div>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current text-white" />
                  <span>Proceed to Payment (₹1,999 Lifetime) →</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Activation via UPI, QR, NetBanking & Cards</span>
            </div>
          </form>
        </div>

        <p className="text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-slate-900 hover:underline">
            Sign in here
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-8 py-6 text-center text-xs text-slate-400 z-10 flex flex-wrap items-center justify-center gap-4">
        <span>© 2026 Welurik Review. All rights reserved.</span>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
          <span>•</span>
          <Link href="/refund" className="hover:text-slate-600">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
