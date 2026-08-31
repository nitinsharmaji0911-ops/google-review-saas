"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Star,
  Printer,
  ChevronRight,
  Calendar,
  ArrowUpRight,
  SlidersHorizontal,
  CheckCircle2,
  Smile
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  business: {
    id: string;
    name: string;
    slug: string;
    category: string;
    location?: string;
    googleReviewUrl: string;
    brandColor?: string;
    aiCallsThisMonth: number;
    monthlyAiQuota: number;
  };
  metrics: {
    totalScans: number;
    reviewsGenerated: number;
    googleClicks: number;
    conversionRate: string;
  };
  topTopics: { name: string; count: number; percentage: number }[];
  recentReviews: {
    id: string;
    rating: number;
    selectedTopics: string[];
    selectedServices: string[];
    generatedReview: string;
    status: string;
    createdAt: string;
  }[];
  unreadFeedbackCount: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/business/the-coffee-house");
        const bData = await res.json();

        if (bData.success && bData.business) {
          const biz = bData.business;

          setData({
            business: biz,
            metrics: {
              totalScans: 342,
              reviewsGenerated: 96,
              googleClicks: 71,
              conversionRate: "20.7%",
            },
            topTopics: [
              { name: "Coffee Quality", count: 82, percentage: 85 },
              { name: "Friendly Baristas", count: 67, percentage: 70 },
              { name: "Cozy Ambience", count: 54, percentage: 56 },
              { name: "Fresh Bakery Items", count: 41, percentage: 42 },
              { name: "Fast Wi-Fi & Work Friendly", count: 38, percentage: 39 },
            ],
            recentReviews: [
              {
                id: "r1",
                rating: 5,
                selectedTopics: ["Coffee Quality", "Friendly Baristas", "Cozy Ambience"],
                selectedServices: ["Specialty Coffee", "Artisan Bakery"],
                generatedReview:
                  "Had a fantastic experience at The Coffee House! The specialty coffee and artisan bakery items were top notch. The friendly baristas and cozy ambience really stood out. Highly recommend!",
                status: "opened_google",
                createdAt: "10 mins ago",
              },
              {
                id: "r2",
                rating: 5,
                selectedTopics: ["Quick Service", "Cleanliness", "Value for Money"],
                selectedServices: ["All-Day Breakfast", "Cold Brew"],
                generatedReview:
                  "Really impressed with The Coffee House. The all-day breakfast and cold brew was great, and the cleanliness and quick service made the visit smooth and enjoyable. 5 stars!",
                status: "copied",
                createdAt: "1 hour ago",
              },
              {
                id: "r3",
                rating: 5,
                selectedTopics: ["Fast Wi-Fi & Work Friendly", "Coffee Quality"],
                selectedServices: ["Specialty Coffee"],
                generatedReview:
                  "Visited The Coffee House recently and loved it. The coffee quality was exceptional and it's a very fast Wi-Fi and work-friendly environment. Looking forward to my next visit!",
                status: "opened_google",
                createdAt: "3 hours ago",
              },
            ],
            unreadFeedbackCount: 1,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const customerLink = `${origin}/r/${data.business.slug}`;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Live Funnel
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-xs">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              Lifetime Pro Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time scan velocity, AI generation metrics, and Google Maps review performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={customerLink}
            className="text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
          >
            Test Funnel <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <Link
            href="/qr-studio"
            className="text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print Standees
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total QR Scans</span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{data.metrics.totalScans}</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Total smartphone camera scans</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reviews Formulated</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{data.metrics.reviewsGenerated}</h3>
            <span className="text-xs font-semibold text-slate-500">28.0% tap rate</span>
          </div>
          <p className="text-[11px] text-slate-400">AI reviews formulated by visitors</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Posted to Google</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{data.metrics.googleClicks}</h3>
            <span className="text-xs font-semibold text-emerald-600">74% copy rate</span>
          </div>
          <p className="text-[11px] text-slate-400">Copied & opened Google box</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conversion %</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{data.metrics.conversionRate}</h3>
            <span className="text-xs font-semibold text-emerald-600">High</span>
          </div>
          <p className="text-[11px] text-slate-400">Scan to Google handoff rate</p>
        </div>
      </div>

      {/* 2-Column Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Customer Praises (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Customer Praises</h3>
            <p className="text-[11px] text-slate-400">Most frequent aspects mentioned by customers</p>
          </div>

          <div className="space-y-3.5">
            {data.topTopics.map((topic, i) => (
              <div key={topic.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-3 text-slate-400 font-mono text-[10px]">#{i + 1}</span>
                    {topic.name}
                  </span>
                  <span className="text-slate-500 font-normal text-[11px]">{topic.count} mentions</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-500"
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/settings"
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center justify-between"
            >
              <span>Edit keywords & services</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Reviews Activity (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Generated Reviews</h3>
              <p className="text-[11px] text-slate-400">Live reviews formulated by scanning customers</p>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Today
            </span>
          </div>

          <div className="space-y-3">
            {data.recentReviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {rev.status === "opened_google" ? "Posted to Google" : "Copied"}
                    </span>
                    <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic font-normal">"{rev.generatedReview}"</p>

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {rev.selectedTopics.map((t) => (
                    <span key={t} className="text-[10px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200/80">
                      {t}
                    </span>
                  ))}
                  {rev.selectedServices.map((s) => (
                    <span key={s} className="text-[10px] font-medium bg-slate-200/60 text-slate-800 px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
