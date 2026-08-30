"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, getCategoryById } from "@/lib/categories";
import { Sparkles, ArrowRight, Store, Link as LinkIcon, Check, Star } from "lucide-react";
import Link from "next/link";

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

  const selectedCategoryConfig = getCategoryById(category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !googleReviewUrl) return;

    setLoading(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between py-8 px-6 relative overflow-hidden">
      {/* Ambient Neon Glow */}
      <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-300/20 via-indigo-200/25 to-purple-300/20 rounded-full blur-[130px] pointer-events-none -z-10" />

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
            Setup Your Business Funnel
          </h1>
          <p className="text-xs text-slate-500">
            Get your custom QR standee and Google Review Assistant ready in 2 minutes.
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
                  Found in your Google Business Profile under "Ask for reviews".
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
                  Confirm & Review <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmation */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Ready to Launch! 🚀</h2>
                <p className="text-xs text-slate-400 mt-0.5">We've pre-configured your keywords and standee.</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Business:</span>
                  <span className="font-bold text-slate-900">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Industry:</span>
                  <span className="font-semibold text-slate-900 capitalize">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Keywords:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedCategoryConfig.defaultServices.slice(0, 2).join(", ")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                >
                  {loading ? "Launching..." : "Open My Dashboard 🚀"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 z-10">
        © 2026 Welurik Review. Built for local businesses.
      </footer>
    </div>
  );
}
