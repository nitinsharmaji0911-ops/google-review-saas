"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, getCategoryById } from "@/lib/categories";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Lock, Zap } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form Data
  const [name, setName] = useState("");
  const [category, setCategory] = useState("cafe");
  const [location, setLocation] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#0f172a");
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const selectedCategoryConfig = getCategoryById(category);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayAndActivate = async () => {
    if (!name || !googleReviewUrl) return;

    setLoading(true);
    setPaymentError("");

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      // 1. Save business configuration first
      await fetch("/api/business/" + slug, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          location,
          googleReviewUrl,
          brandColor,
          services: selectedCategoryConfig.defaultServices,
          topics: [
            ...selectedCategoryConfig.positiveTopics.map((n) => ({ name: n, type: "positive" })),
            ...selectedCategoryConfig.issueTopics.map((n) => ({ name: n, type: "issue" })),
          ],
        }),
      });

      // 2. Initialize Razorpay Order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: "lifetime" }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Could not initialize payment");
      }

      // 3. Load Razorpay Checkout Modal
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Welurik Review",
        description: "₹1,999 Lifetime License Activation",
        order_id: orderData.orderId,
        image: "/favicon.png",
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType: "lifetime",
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              router.push("/dashboard");
              router.refresh();
            } else {
              setPaymentError(verifyData.error || "Payment verification failed.");
              setLoading(false);
            }
          } catch (err: any) {
            setPaymentError("Error confirming transaction.");
            setLoading(false);
          }
        },
        prefill: {
          email: orderData.prefill?.email || "",
        },
        theme: {
          color: "#0f172a",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setPaymentError(response.error?.description || "Payment was not completed.");
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || "Failed to start payment checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between py-8 px-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-emerald-200/20 via-teal-200/25 to-slate-200/20 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto px-4 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-black text-2xl text-slate-950 tracking-tight">W</span>
          <span className="text-slate-300 font-light text-xl -mt-0.5">|</span>
          <span className="font-bold text-lg text-slate-950 tracking-tight">Welurik Review</span>
        </Link>
        <span className="text-xs font-semibold text-slate-400">Step {step} of 3</span>
      </header>

      <div className="w-full max-w-md mx-auto my-auto z-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {step === 3 ? "Activate Lifetime License" : "Setup Your Business Funnel"}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 3
              ? "Complete payment to unlock your QR standee studio and dashboard."
              : "Get your custom QR standee and Google Review Assistant ready."}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  step >= s ? "bg-slate-950 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`w-6 h-0.5 ${step > s ? "bg-slate-950" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* Main Step Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-7 sm:p-8 border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.06)] space-y-5">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">What is your business?</h2>
                <p className="text-xs text-slate-400 mt-0.5">Enter your business name and industry.</p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. The Coffee House, Glow Salon"
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium text-slate-900 capitalize"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Indiranagar, Bengaluru"
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-200 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10 transition-all"
              >
                Continue to Review Link <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 2: Google Review Link */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Google Business Review Link</h2>
                <p className="text-xs text-slate-400 mt-0.5">Where customers will post their 5-star reviews.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Review URL
                </label>
                <input
                  type="url"
                  required
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/your-id/review"
                  className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-mono text-slate-900"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Found in your Google Business Profile under &quot;Ask for reviews&quot;.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!googleReviewUrl.trim()}
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-200 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                >
                  Proceed to Payment <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Lock & Activation */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> One-Time Lifetime License
                </div>
                <h2 className="text-xl font-bold text-slate-950">Activate & Launch</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete your ₹1,999 one-time payment to unlock your workspace.
                </p>
              </div>

              {/* Price Pill */}
              <div className="bg-slate-950 text-white rounded-2xl p-4.5 space-y-3 shadow-lg">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-medium text-slate-300">Lifetime License</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">₹1,999</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">One-time payment</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2.5 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Unlimited AI Google Reviews forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Printable Acrylic QR Standee generator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Zero monthly subscription fees</span>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                  {paymentError}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(2)}
                  className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePayAndActivate}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-full text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Opening Gateway...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Pay ₹1,999 & Unlock Dashboard
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Secured by Razorpay • Instant UPI, Cards & NetBanking
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 z-10">
        © 2026 Welurik Review. Built for local businesses.
      </footer>
    </div>
  );
}
