"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Printer,
  SlidersHorizontal,
  MessageSquare,
  ExternalLink,
  QrCode,
  LogOut,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import WelurikLogo from "@/components/Logo";
import { CheckoutButton } from "@/components/CheckoutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/business/me")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d && d.success) {
          if (d.business) {
            setBusiness(d.business);
            setUnreadCount(d.unreadFeedbackCount || 0);
          } else {
            // User is authenticated but hasn't completed onboarding
            if (pathname !== "/onboarding") {
              router.push("/onboarding");
            }
          }
        }
      })
      .catch(() => {});
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

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
      count: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const origin = typeof window !== "undefined" ? window.location.origin : "https://review.welurik.com";
  const publicReviewUrl = business?.slug ? `${origin}/r/${business.slug}` : "#";

  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-slate-900 selection:text-white">
      {/* LEFT SIDEBAR (Linear / Vercel style) */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 hidden md:flex no-print">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="px-2 py-1.5 flex items-center">
            <WelurikLogo className="h-9 sm:h-[48px]" />
          </div>

          {/* Active Business Switcher Card */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Business</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {business?.name ? business.name.charAt(0) : "B"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{business?.name || "Loading..."}</p>
                <p className="text-[10px] text-slate-400 capitalize truncate">{business?.category || "Workspace"}</p>
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
                        isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
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

        {/* Bottom CTA / Quick Customer Link & Logout */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          {business?.slug && (
            <a
              href={publicReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
              <span>Live Customer Link</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 no-print">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              {business?.name ? business.name.charAt(0) : "W"}
            </div>
            <span className="font-bold text-sm text-slate-900 truncate max-w-[140px]">{business?.name || "Welurik"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/qr-studio"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 text-white"
            >
              QR
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>{loggingOut ? "..." : "Logout"}</span>
            </button>
          </div>
        </header>

        {/* Unpaid Account Paywall Guard */}
        {business && business.isPro !== true && pathname !== "/onboarding" ? (
          <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xl space-y-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Lifetime License Required
                </div>
                <h2 className="text-2xl font-black text-slate-950">Activate Your Workspace</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete your one-time payment of <strong>₹1,999</strong> to unlock your analytics dashboard, QR standee studio, and start getting 5-star Google reviews.
                </p>
              </div>

              <div className="bg-slate-950 text-white rounded-2xl p-4.5 space-y-3 text-left">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-300 font-medium">Lifetime Pro License</span>
                  <span className="text-2xl font-black text-white">₹1,999</span>
                </div>
                <div className="border-t border-slate-800 pt-2 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Unlimited AI Google Review Generations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Printable Acrylic QR Standees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Zero monthly recurring fees</span>
                  </div>
                </div>
              </div>

              <CheckoutButton
                planType="lifetime"
                buttonText="Pay ₹1,999 with UPI / Card to Unlock"
                className="w-full py-4 text-xs font-black"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</div>
        )}

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
          {business?.slug && (
            <a
              href={publicReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-900"
            >
              <QrCode className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] mt-0.5 text-emerald-600 font-semibold">Funnel</span>
            </a>
          )}
        </nav>
      </div>
    </div>
  );
}
