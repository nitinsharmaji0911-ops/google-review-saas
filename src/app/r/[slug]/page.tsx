"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Copy,
  ExternalLink,
  CheckCircle2,
  Star,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

interface Topic {
  id: string;
  name: string;
  type: string;
}

interface Service {
  id: string;
  name: string;
}

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  category: string;
  location?: string;
  description?: string;
  googleReviewUrl: string;
  brandColor?: string;
  services: Service[];
  topics: Topic[];
}

export default function CustomerReviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Customer Selections
  const [rating, setRating] = useState(5);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customerComment, setCustomerComment] = useState("");
  const [tone, setTone] = useState<"short" | "natural" | "detailed">("natural");

  // Review State & Tone Cache
  const [generatedReview, setGeneratedReview] = useState("");
  const [toneCache, setToneCache] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [step, setStep] = useState<"select" | "review">("select");

  useEffect(() => {
    async function loadBusiness() {
      try {
        setLoading(true);
        const res = await fetch(`/api/business/${slug}`);
        const data = await res.json();

        if (data.success && data.business) {
          setBusiness(data.business);

          fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessSlug: slug,
              eventType: "scan",
            }),
          }).catch(() => {});
        } else {
          setError(data.error || "Business not found");
        }
      } catch {
        setError("Failed to load business details");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadBusiness();
    }
  }, [slug]);

  const toggleTopic = (topicName: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleGenerate = async (targetTone: "short" | "natural" | "detailed" = tone) => {
    if (!business) return;

    if (toneCache[targetTone]) {
      setTone(targetTone);
      setGeneratedReview(toneCache[targetTone]);
      setIsCopied(false);
      return;
    }

    setTone(targetTone);
    setIsCopied(false);

    if (step === "review") {
      setIsRegenerating(true);
    } else {
      setIsGenerating(true);
    }

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: slug,
          selectedTopics,
          selectedServices,
          customerComment,
          tone: targetTone,
          rating,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setGeneratedReview(data.review);
        setToneCache((prev) => ({ ...prev, [targetTone]: data.review }));
        setStep("review");
      } else {
        alert("Could not generate review. Please try again.");
      }
    } catch {
      alert("Something went wrong while generating the review.");
    } finally {
      setIsGenerating(false);
      setIsRegenerating(false);
    }
  };

  const handleCopyAndOpenGoogle = async () => {
    if (!business) return;

    const targetUrl =
      business.googleReviewUrl && business.googleReviewUrl.trim().length > 0
        ? business.googleReviewUrl.trim()
        : "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4";

    // 1. Copy review text to clipboard
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedReview);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      setIsCopied(true);
    } catch {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = generatedReview;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setIsCopied(true);
      } catch {
        setIsCopied(true);
      }
    }

    // 2. Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}

    // 3. Track conversion analytics
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug: slug,
        eventType: "google_clicked",
      }),
    }).catch(() => {});

    // 4. Redirect directly to Google Maps review page
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Business Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">{error || "This review link may be inactive."}</p>
          <Link
            href="/"
            className="mt-5 inline-block text-xs font-medium text-slate-900 hover:bg-slate-100 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const allTopics = business.topics || [];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col justify-between items-center py-8 px-4 font-sans selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-sm mx-auto">
        {/* Brand Identity */}
        <div className="text-center mb-6 space-y-1">
          <span className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
            Review & Feedback
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {business.name}
          </h1>
          {business.location && (
            <p className="text-xs text-slate-400 font-normal">{business.location}</p>
          )}
        </div>

        {/* STEP 1: EXPERIENCE SELECTION */}
        {step === "select" && (
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/70 space-y-6">
            {/* Star Rating */}
            <div className="text-center">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Rate Your Visit
              </label>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setToneCache({});
                    }}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200 fill-slate-100"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {rating === 5 && "5 Stars • Excellent"}
                {rating === 4 && "4 Stars • Very Good"}
                {rating === 3 && "3 Stars • Good"}
                {rating === 2 && "2 Stars • Fair"}
                {rating === 1 && "1 Star"}
              </p>
            </div>

            {/* Quick Tags / Topics */}
            {allTopics.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2.5">
                  Add Quick Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.name);
                    return (
                      <button
                        key={topic.id || topic.name}
                        type="button"
                        onClick={() => {
                          toggleTopic(topic.name);
                          setToneCache({});
                        }}
                        className={`text-xs font-medium px-3.5 py-2 rounded-xl transition-all border flex items-center gap-1.5 active:scale-95 ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {topic.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Specific Services / Items */}
            {business.services && business.services.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2.5">
                  Items / Services (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {business.services.map((service) => {
                    const isSelected = selectedServices.includes(service.name);
                    return (
                      <button
                        key={service.id || service.name}
                        type="button"
                        onClick={() => {
                          toggleService(service.name);
                          setToneCache({});
                        }}
                        className={`text-xs font-medium px-3 py-1.5 rounded-xl transition-all border flex items-center gap-1.5 active:scale-95 ${
                          isSelected
                            ? "bg-slate-800 text-white border-slate-800"
                            : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3" />}
                        {service.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional Customer Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Review (Optional note)
              </label>
              <textarea
                rows={2}
                value={customerComment}
                onChange={(e) => {
                  setCustomerComment(e.target.value);
                  setToneCache({});
                }}
                placeholder="Share anything specific about your experience..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 placeholder-slate-400 resize-none font-normal transition-all"
              />
            </div>

            {/* Generate CTA Button */}
            <button
              type="button"
              disabled={isGenerating || (selectedTopics.length === 0 && selectedServices.length === 0 && !customerComment)}
              onClick={() => handleGenerate("natural")}
              className={`w-full py-4 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] ${
                isGenerating || (selectedTopics.length === 0 && selectedServices.length === 0 && !customerComment)
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Review...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Review
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: REVIEW PRESENTATION & DIRECT GOOGLE POST */}
        {step === "review" && (
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/70 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="text-xs font-semibold text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Adjust
              </button>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tone Variations Switcher */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Length & Tone
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: "short", label: "Short" },
                  { id: "natural", label: "Balanced" },
                  { id: "detailed", label: "Detailed" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    disabled={isRegenerating}
                    onClick={() => handleGenerate(t.id as any)}
                    className={`py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                      tone === t.id
                        ? "bg-white text-slate-900 shadow-sm font-bold scale-[1.02]"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Review Text Box */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Your Review (Tap to edit)
                </label>
                {isRegenerating && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <div className="w-2.5 h-2.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </span>
                )}
              </div>
              <textarea
                rows={4}
                value={generatedReview}
                onChange={(e) => setGeneratedReview(e.target.value)}
                disabled={isRegenerating}
                className={`w-full text-xs leading-relaxed p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none font-normal transition-opacity ${
                  isRegenerating ? "opacity-40" : "opacity-100"
                }`}
              />
            </div>

            {/* DIRECT GOOGLE POST ACTION BUTTON */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyAndOpenGoogle}
                className="w-full py-4 px-5 active:scale-[0.98] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all bg-[#15803D] hover:bg-[#166534]"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Copied! Redirecting to Google...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Post Review on Google
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </>
                )}
              </button>

              {isCopied ? (
                <a
                  href={
                    business.googleReviewUrl && business.googleReviewUrl.trim().length > 0
                      ? business.googleReviewUrl.trim()
                      : "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"
                  }
                  className="block text-center text-xs font-bold text-[#15803D] hover:underline pt-1 animate-pulse"
                >
                  Click here if Google doesn't open automatically →
                </a>
              ) : (
                <p className="text-center text-[11px] text-slate-400">
                  Review is copied automatically. Simply paste and post on Google!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-8 space-y-1">
        <p className="text-[11px] text-slate-400 font-medium block">
          Powered by Welurik Review
        </p>
      </div>
    </div>
  );
}
