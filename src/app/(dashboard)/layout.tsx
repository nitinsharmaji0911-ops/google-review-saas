"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Printer,
  SlidersHorizontal,
  MessageSquare,
  ExternalLink,
  Sparkles,
  Store,
  ChevronDown,
  LogOut,
  QrCode,
  Star
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [business, setBusiness] = useState<any>({
    name: "The Coffee House",
    category: "Café & Bakery",
    slug: "the-coffee-house",
  });

  useEffect(() => {
    fetch("/api/business/the-coffee-house")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.business) setBusiness(d.business);
      })
      .catch(() => {});
  }, []);

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Standee Studio",
      href: "/qr-studio",
      icon: Printer,
      badge: "Print Ready",
    },
    {
      label: "Keywords & Topics",
      href: "/settings",
      icon: SlidersHorizontal,
    },
    {
      label: "Private Feedback",
      href: "/feedback",
      icon: MessageSquare,
      count: 1,
    },
  ];

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const publicReviewUrl = `${origin}/r/${business.slug || "the-coffee-house"}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-slate-900 selection:text-white">
      {/* LEFT SIDEBAR (Linear / Vercel style) */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 hidden md:flex no-print">
        <div className="space-y-6">
          {/* Brand Logo & SaaS Name */}
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs">
              W
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight block">Welurik Review</span>
              <span className="text-[10px] font-medium text-slate-400 block -mt-0.5">Google Review Assistant</span>
            </div>
          </div>

          {/* Active Business Switcher Card */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Business</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {business.name ? business.name.charAt(0) : "B"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{business.name}</p>
                <p className="text-[10px] text-slate-400 capitalize truncate">{business.category}</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span
                      className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                        isActive ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600 border border-rose-200"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom CTA / Quick Customer Link */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <a
            href={publicReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            Live Customer Link <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <div className="px-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Welurik Review v1.2</span>
            <Link href="/login" className="hover:text-slate-900 font-medium">
              Switch
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 no-print">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <span className="font-bold text-sm text-slate-900">{business.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800"
            >
              Dashboard
            </Link>
            <Link
              href="/qr-studio"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 text-white"
            >
              QR
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</div>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-2 py-2 flex items-center justify-around z-30 no-print">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-slate-950 stroke-[2.5]" : "text-slate-400"}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}
          <a
            href={publicReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-900"
          >
            <QrCode className="w-5 h-5 text-indigo-600" />
            <span className="text-[10px] mt-0.5 text-indigo-600 font-semibold">Funnel</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
