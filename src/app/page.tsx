"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  Sparkles,
  CheckCircle2,
  Printer,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  ChevronDown,
  Menu,
  X,
  Copy,
  Check,
  Play
} from "lucide-react";
import WelurikLogo from "@/components/Logo";
import { CheckoutButton } from "@/components/CheckoutButton";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      stepNumber: "1",
      stepTitle: "scan & rate",
      header: "Step 1: Scan Table Standee",
      content: {
        greeting: "Hi Sarah!",
        sub: "How was your experience with us today?",
        rating: 5,
        badgeText: "5 Stars • Excellent",
        actionText: "Continue to Quick Tags",
      },
    },
    {
      stepNumber: "2",
      stepTitle: "pick tags",
      header: "Step 2: Tap What You Loved",
      content: {
        title: "Select your highlights:",
        tags: [
          { name: "☕ Specialty Latte", selected: true },
          { name: "🥐 Warm Croissant", selected: true },
          { name: "⚡ Fast Free Wi-Fi", selected: true },
          { name: "😊 Friendly Staff", selected: true },
          { name: "🎵 Chill Ambience", selected: false },
        ],
        actionText: "Generate Review with AI ⚡",
      },
    },
    {
      stepNumber: "3",
      stepTitle: "ai magic",
      header: "Step 3: 30-Second AI Generation",
      content: {
        review: "Had a wonderful morning at The Coffee House! The Specialty Latte was rich and delicious, and the warm croissants were fresh out of the oven. Super fast Wi-Fi and friendly staff make this my favorite spot in town!",
        actionText: "Copy & Open Google Review",
        copied: true,
      },
    },
    {
      stepNumber: "4",
      stepTitle: "google 5★",
      header: "Step 4: Live on Google Maps",
      content: {
        reviewerName: "Sarah Jenkins",
        reviewerRole: "Local Guide • 42 reviews",
        timeAgo: "2 minutes ago",
        reviewSnippet: "The Coffee House is easily our favorite spot in town! Incredible Specialty Latte, warm fresh croissants, and awesome staff. 10/10 recommend!",
        rankingBadge: "🏆 Ranked #1 in Google Maps Local Pack",
      },
    },
  ];

  // Auto-play slideshow every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Does this violate Google's Review Gating policies?",
      a: "No. Welurik Review is 100% Google policy compliant. All customers have direct access to leave a Google review regardless of their rating. We provide a private feedback option for direct feedback without restricting anyone from posting on Google.",
    },
    {
      q: "How does this boost my Google Maps (GMB) ranking?",
      a: "Google's algorithm prioritizes businesses with frequent, detailed reviews that naturally mention key services (e.g., 'Specialty Coffee', 'Keratin Treatment', 'Ceramic Coating'). Our AI naturally weaves your configured service keywords into the customer's review, signaling local relevance to Google's ranking engine.",
    },
    {
      q: "How much does the AI cost to run monthly?",
      a: "Virtually ₹0. The system uses a high-speed hybrid engine: local NLP phrase templates that cost ₹0, backed by ultra-affordable Google Gemini Flash (~₹0.003 per generation). There are zero hidden API bills.",
    },
    {
      q: "Can I print standees for multiple tables or counters?",
      a: "Yes! You get unlimited access to the Standee Studio. You can download and print high-resolution QR standees formatted for standard 4\" x 6\" acrylic frames, foldable table tents, or counter stickers for as many tables as you have.",
    },
    {
      q: "Is there any monthly subscription fee?",
      a: "No. The license is a one-time payment of ₹1,999 for lifetime access for your business. No monthly charges, no recurring fees.",
    },
  ];

  return (
    <div className="neo-canvas-bg min-h-screen text-[#0C0E14] font-sans selection:bg-[#15803D] selection:text-white relative overflow-x-hidden">
      
      {/* Active Neo-Grid Background */}
      <div className="neo-grid-overlay absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-75" />
      <div className="absolute top-[2%] right-[-5%] sm:right-[5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-[#bbf7d0]/40 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[8%] left-[-10%] sm:left-[2%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#dcfce7]/50 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[50%] right-[5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#bbf7d0]/30 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* 
        ========================================================================
        FLOATING STADIUM PILL NAVBAR
        ========================================================================
      */}
      <div className="w-full max-w-[1080px] mx-auto px-3.5 sm:px-4 pt-3.5 sm:pt-6 z-40 relative">
        <header className="w-full bg-white border-2 border-black rounded-full px-3.5 sm:px-6 py-1.5 sm:py-2.5 shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="group hover:opacity-90 transition-opacity flex items-center">
            <WelurikLogo className="h-7 sm:h-9" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold text-slate-700">
            <Link href="/#how-it-works" className="hover:text-black transition-colors">How It Works</Link>
            <Link href="/#features" className="hover:text-black transition-colors">Features</Link>
            <Link href="/#pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/#faq" className="hover:text-black transition-colors">FAQ</Link>
            <Link href="/r/the-coffee-house" className="text-[#15803D] font-bold hover:text-[#166534] transition-colors">Demo</Link>
            <Link href="/dashboard" className="hover:text-black transition-colors">Admin Dashboard</Link>
          </nav>

          {/* Action / Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-[12px] sm:text-[13px] font-bold text-black hover:text-slate-600 transition-colors px-2 py-1"
            >
              Sign In
            </Link>

            {/* Desktop Only: Get Started Button */}
            <Link
              href="/signup"
              className="hidden md:inline-flex text-[13px] font-bold text-white bg-black hover:bg-neutral-800 px-5 py-2 rounded-full border border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all"
            >
              Get Started
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 text-black hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-3.5 right-3.5 mt-2 bg-white border-2 border-black rounded-3xl p-4 sm:p-5 shadow-[4px_4px_0px_#000000] space-y-2.5 z-50 animate-in fade-in slide-in-from-top-2">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-bold text-black"
            >
              How It Works
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-bold text-black"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-bold text-black"
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-bold text-black"
            >
              FAQ
            </Link>
            <Link
              href="/r/the-coffee-house"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-bold text-[#15803D]"
            >
              Customer Demo Funnel
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-bold text-black"
            >
              Admin Dashboard
            </Link>
            <div className="pt-2 border-t-2 border-black/10 flex flex-col gap-2">
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#15803D] border-2 border-black rounded-full shadow-[2px_2px_0px_#000000]"
              >
                Get Lifetime Access (₹1,999)
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 
        ========================================================================
        HERO SECTION (Optimized Mobile Flow + Desktop Power)
        ========================================================================
      */}
      <section className="w-full max-w-[1140px] mx-auto px-4 sm:px-8 pt-5 sm:pt-12 pb-10 sm:pb-20 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
          
          {/* LEFT COLUMN: Typography & CTAs (Tight & Punchy on Mobile) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left pr-0 lg:pr-4">
            
            {/* Google Verified 4.9 Star Rating Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] text-[11px] sm:text-xs font-bold text-black select-none">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="font-black text-black">4.9 on Google Maps</span>
              <div className="flex text-amber-400 gap-0.5 items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-[30px] xs:text-[38px] sm:text-5xl lg:text-[60px] font-black text-black tracking-[-0.035em] leading-[1.08] sm:leading-[1.04]">
              Turn Happy Customers <br className="hidden xs:inline" />
              into <span className="text-[#15803D] underline decoration-4 decoration-[#15803D]/30">5-Star Reviews</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[13px] sm:text-base lg:text-[17px] text-slate-700 font-medium leading-[1.5] sm:leading-[1.6] max-w-[510px] mx-auto lg:mx-0">
              AI-powered QR standees that eliminate customer writer's block and multiply your Google Maps reviews in 30 seconds.
            </p>

            {/* Visual Standee Card for Mobile & Tablet */}
            <div className="lg:hidden p-3 bg-gradient-to-r from-emerald-50 via-white to-amber-50 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center gap-3 text-left my-2">
              <img
                src="/images/hero-standee-badge.jpg"
                alt="4x6 Table Standee"
                className="w-16 h-16 rounded-xl border-2 border-black object-cover shrink-0 shadow-[1px_1px_0px_#000000]"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-[9.5px] font-black uppercase tracking-wider bg-[#15803D] text-white px-2 py-0.5 rounded-md">
                    Print-Ready
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    ★ 5-Star Boost
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 truncate">4" x 6" Acrylic Table Standee</p>
                <p className="text-[10.5px] text-slate-600 font-medium">Place on tables or billing counter • Scan in 30s</p>
              </div>
            </div>

            {/* Clean Mobile & Desktop CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-full text-[13px] sm:text-[14px] font-black border-2 border-black shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-center"
              >
                Get Lifetime Access (₹1,999) <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/r/the-coffee-house"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 bg-white hover:bg-slate-50 text-black rounded-full text-[12.5px] sm:text-[14px] font-bold border-2 border-black shadow-[2px_2px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-center"
              >
                <Play className="w-3 h-3 fill-black text-black" /> Try Customer Demo
              </Link>
            </div>

            {/* Micro Tags & Social Proof Strip */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs text-slate-600 font-bold">
                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">✓ Auto-Feedback Filter</span>
                <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full border border-slate-200">✓ Smart Keywords</span>
                <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">✓ 1-Click Google Handoff</span>
              </div>

              {/* Real Human Avatar Social Proof Strip */}
              <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
                <div className="flex -space-x-2 overflow-hidden items-center">
                  <div className="relative inline-block h-9 w-9 rounded-full ring-2 ring-white border border-black overflow-hidden shadow-xs">
                    <img src="/images/standee-cafe-counter.jpg" alt="Cafe Owner" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative inline-block h-9 w-9 rounded-full ring-2 ring-white border border-black overflow-hidden shadow-xs">
                    <img src="/images/retail-display-mockup.jpg" alt="Clinic Founder" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative inline-block h-9 w-9 rounded-full ring-2 ring-white border border-black overflow-hidden shadow-xs">
                    <img src="/images/hero-standee-badge.jpg" alt="Salon Owner" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative inline-block h-9 w-9 rounded-full ring-2 ring-white border border-black overflow-hidden shadow-xs">
                    <img src="/images/google-stars-boost.jpg" alt="Restaurant Owner" className="w-full h-full object-cover" />
                  </div>
                  <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-slate-900 text-white font-black text-[10px] flex items-center justify-center border border-black">
                    +250
                  </div>
                </div>
                <div className="text-left text-[11.5px] font-bold text-slate-700 leading-tight">
                  <span className="text-black font-black">250+ Business Owners</span> active<br />
                  <span className="text-[#15803D] font-extrabold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    ★ 4.9/5 Average Rating Boost
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Smartphone Mockup + Standee Floating Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative pt-2 sm:py-4">
            {/* Background Standee Real Photo Preview Card */}
            <div className="hidden xl:block absolute -top-6 -right-10 w-44 rounded-2xl border-2 border-black bg-white p-1.5 shadow-[4px_4px_0px_#000000] rotate-6 z-20 hover:rotate-0 transition-transform duration-300">
              <img
                src="/images/standee-cafe-counter.jpg"
                alt="Acrylic QR Table Standee"
                className="w-full h-28 object-cover rounded-xl"
              />
              <p className="text-[9px] font-black text-black pt-1 px-1 text-center">4"x6" Acrylic Standee</p>
            </div>
            
            <div 
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[320px] bg-white rounded-[40px] sm:rounded-[46px] border-[3px] sm:border-[3.5px] border-black relative z-10 select-none shadow-[6px_6px_0px_#000000] sm:shadow-[8px_8px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_#000000] transition-all"
            >
              {/* Dynamic Island */}
              <div className="pt-3 pb-1 text-center">
                <div className="w-[76px] sm:w-[84px] h-[15px] sm:h-[18px] bg-black rounded-full mx-auto" />
              </div>

              {/* Inside Screen */}
              <div className="p-3 sm:p-4 min-h-[420px] sm:min-h-[460px] flex flex-col justify-between text-left">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b-2 border-black/10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-black">
                      W
                    </div>
                    <span className="text-[10.5px] sm:text-[11px] font-black text-black tracking-tight truncate max-w-[145px]">
                      {slides[currentSlide].header}
                    </span>
                  </div>
                  <span className="text-[8.5px] sm:text-[9.5px] font-black px-2 py-0.5 bg-[#dcfce7] text-[#15803D] border border-black rounded-full">
                    {currentSlide + 1}/4
                  </span>
                </div>

                {/* Slides */}
                <div className="my-auto py-1">
                  {currentSlide === 0 && (
                    <div className="space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="bg-[#FAF9F5] p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
                        <p className="text-[10.5px] font-black text-black">Hi Sarah! 👋</p>
                        <p className="text-[9.5px] text-slate-600">How was your visit today?</p>
                      </div>

                      <div className="bg-white p-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2 text-center">
                        <div className="flex justify-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[9.5px] font-bold text-[#15803D] bg-[#dcfce7] border border-black px-2 py-0.5 rounded-full inline-block">
                          5 Stars • Excellent
                        </span>
                        <button 
                          onClick={() => setCurrentSlide(1)}
                          className="w-full py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm"
                        >
                          Next: Pick Highlights <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {currentSlide === 1 && (
                    <div className="space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[10.5px] font-black text-black">What did you enjoy most?</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: "☕ Specialty Latte", sel: true },
                          { name: "🥐 Warm Croissant", sel: true },
                          { name: "⚡ Fast Free Wi-Fi", sel: true },
                          { name: "😊 Friendly Staff", sel: true },
                        ].map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-bold px-2 py-1 rounded-xl border-2 border-black flex items-center gap-1 bg-[#dcfce7] text-[#15803D] shadow-[1px_1px_0px_#000000]"
                          >
                            {t.name} <Check className="w-2.5 h-2.5 text-[#15803D]" />
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={() => setCurrentSlide(2)}
                        className="w-full py-2 bg-[#15803D] text-white border-2 border-black rounded-xl text-[10px] font-black flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000000]"
                      >
                        <Sparkles className="w-3 h-3" /> Generate Review with AI
                      </button>
                    </div>
                  )}

                  {currentSlide === 2 && (
                    <div className="space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="bg-[#FAF9F5] border-2 border-black rounded-2xl p-2.5 space-y-1.5 shadow-[2px_2px_0px_#000000]">
                        <span className="text-[9px] font-black text-black flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#15803D]" /> AI Review Generated:
                        </span>
                        <p className="text-[9px] text-slate-800 leading-relaxed italic bg-white p-2 rounded-xl border border-black/20">
                          "Wonderful morning at The Coffee House! The Specialty Latte was delicious, and the croissants were fresh out of the oven. 10/10 recommend!"
                        </p>
                      </div>

                      <button 
                        onClick={() => setCurrentSlide(3)}
                        className="w-full py-2 bg-[#15803D] text-white border-2 border-black rounded-xl text-[10px] font-black flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000000]"
                      >
                        <Copy className="w-3 h-3" /> Copy & Open Google Maps
                      </button>
                    </div>
                  )}

                  {currentSlide === 3 && (
                    <div className="space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="bg-white border-2 border-black rounded-2xl p-2.5 shadow-[2px_2px_0px_#000000] space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[8.5px] font-black">
                            S
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9.5px] font-black text-black">Sarah Jenkins</p>
                            <p className="text-[7.5px] text-slate-500">Local Guide • 5 Stars</p>
                          </div>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[8.5px] text-slate-800 leading-relaxed">
                          The Coffee House is our favorite spot in town! Incredible latte & croissants!
                        </p>
                      </div>

                      <div className="p-1.5 bg-[#dcfce7] border-2 border-black rounded-xl text-center shadow-[1px_1px_0px_#000000]">
                        <span className="text-[9px] font-black text-[#15803D]">
                          🏆 Ranked #1 in Local Map Pack
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step Pills */}
                <div className="pt-2 border-t-2 border-black/10 flex items-center gap-1">
                  {slides.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`flex-1 py-1 px-0.5 rounded-lg text-[8px] sm:text-[8.5px] font-black transition-all text-center border ${
                        currentSlide === idx
                          ? "bg-black text-white border-black"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {s.stepTitle}
                    </button>
                  ))}
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 
        ========================================================================
        SOCIAL PROOF BAR
        ========================================================================
      */}
      <section className="py-6 sm:py-8 border-y-2 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <p className="text-[10.5px] sm:text-xs font-black uppercase tracking-widest text-slate-500">
            Trusted by 250+ Cafés, Salons, Clinics, Restaurants & Auto Studios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 text-black text-xs sm:text-sm font-bold">
            <span className="flex items-center gap-1">☕ Specialty Cafés</span>
            <span className="flex items-center gap-1">💇‍♀️ Luxury Salons</span>
            <span className="flex items-center gap-1">🍽️ Fine Dining</span>
            <span className="flex items-center gap-1">🦷 Healthcare</span>
            <span className="flex items-center gap-1">🚗 Auto Studios</span>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        HOW IT WORKS (3 Simple Steps)
        ========================================================================
      */}
      <section id="how-it-works" className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-10 sm:space-y-14">
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <span className="text-xs font-black text-[#15803D] uppercase tracking-widest bg-[#dcfce7] px-3.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] inline-block">
            zero friction
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Eliminate customer writer's block and make leaving 5-star reviews effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 Card with Photo */}
          <div className="bg-white p-6 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between overflow-hidden">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black text-white border-2 border-black rounded-xl flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000000]">
                1
              </div>
              <h3 className="text-base font-black text-black">Scan Table Standee</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Place sleek 4" x 6" acrylic standees on tables, reception counters, or billing desks. Customers simply scan with their phone camera.
              </p>
            </div>
            <div className="relative rounded-2xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000000] mt-2 group">
              <img
                src="/images/standee-cafe-counter.jpg"
                alt="Acrylic QR standee on cafe table"
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                In-Store Table Tent
              </div>
            </div>
          </div>

          {/* Step 2 Card with Photo */}
          <div className="bg-white p-6 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between overflow-hidden">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#15803D] text-white border-2 border-black rounded-xl flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000000]">
                2
              </div>
              <h3 className="text-base font-black text-black">Tap What They Loved</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Customers tap simple pills (e.g. "Great Coffee", "Fast Wi-Fi"). AI instantly crafts a genuine, polite, keyword-rich 5-star review.
              </p>
            </div>
            <div className="relative rounded-2xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000000] mt-2 group">
              <img
                src="/images/retail-display-mockup.jpg"
                alt="Reception counter QR display"
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 bg-[#15803D] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Billing Desk Display
              </div>
            </div>
          </div>

          {/* Step 3 Card with Photo */}
          <div className="bg-white p-6 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between overflow-hidden">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black text-white border-2 border-black rounded-xl flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000000]">
                3
              </div>
              <h3 className="text-base font-black text-black">1-Tap Google Post</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                The review copies to clipboard and instantly redirects to your Google Business profile. The customer pastes and submits in 5 seconds!
              </p>
            </div>
            <div className="relative rounded-2xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000000] mt-2 group">
              <img
                src="/images/google-stars-boost.jpg"
                alt="5-star Google review explosion"
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md">
                +42 Reviews Boost
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        VISUAL SHOWCASE / REAL-WORLD RESULTS GALLERY
        ========================================================================
      */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-10 sm:space-y-12">
        <div className="bg-[#111827] text-white rounded-[36px] p-6 sm:p-12 border-2 border-black shadow-[6px_6px_0px_#000000] space-y-8 relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#15803D]/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-xl space-y-3 relative z-10">
            <span className="text-[11px] font-black uppercase tracking-widest bg-[#15803D] text-white px-3 py-1 rounded-full inline-block">
              Print & Place In 5 Minutes
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Sits Beautifully On Any Table, Reception Or Counter
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              No expensive NFC hardware or monthly hardware rentals. Download print-ready vector designs from your dashboard and slide them into standard 4" x 6" acrylic frames.
            </p>
          </div>

          {/* 3 Showcase Visual Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 backdrop-blur-xs">
              <img
                src="/images/standee-cafe-counter.jpg"
                alt="Cafes and Coffee Roasters"
                className="w-full h-40 object-cover rounded-xl border border-white/10"
              />
              <h4 className="text-sm font-bold text-white">Specialty Cafes & Bakeries</h4>
              <p className="text-xs text-slate-400">
                Customers scan while waiting for their cold brew or brunch. Average 15+ new Google reviews every week.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 backdrop-blur-xs">
              <img
                src="/images/retail-display-mockup.jpg"
                alt="Salons and Healthcare Clinics"
                className="w-full h-40 object-cover rounded-xl border border-white/10"
              />
              <h4 className="text-sm font-bold text-white">Salons, Spas & Clinics</h4>
              <p className="text-xs text-slate-400">
                Position right beside your iPad billing terminal. Capture positive reviews right when customer satisfaction is highest.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 backdrop-blur-xs">
              <img
                src="/images/google-stars-boost.jpg"
                alt="Google Map Pack Domination"
                className="w-full h-40 object-cover rounded-xl border border-white/10"
              />
              <h4 className="text-sm font-bold text-white">Dominate Google Maps</h4>
              <p className="text-xs text-slate-400">
                Rich reviews containing your service keywords propel your profile into the top 3 recommendations on Google Maps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        BENTO GRID FEATURES
        ========================================================================
      */}
      <section id="features" className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-10 sm:space-y-14 border-t-2 border-black/10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            powerful architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            Everything You Need To Dominate Google Maps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-9 h-9 bg-slate-100 border-2 border-black rounded-xl flex items-center justify-center text-black">
              <Printer className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Standee & Table Tent Studio</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Print ready 4" x 6" acrylic standee templates, table tent foldables, and register badges with crisp vector QR codes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-9 h-9 bg-[#dcfce7] border-2 border-black rounded-xl flex items-center justify-center text-[#15803D]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Polite Sentiment Modulation</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Every review maintains a courteous tone. Low ratings produce constructive, polite feedback for operational improvement.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-9 h-9 bg-amber-50 border-2 border-black rounded-xl flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Target Keyword SEO Booster</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Naturally weaved service keywords signal Google's ranking engine to place your business in the Top 3 Local Map Pack.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-9 h-9 bg-[#dcfce7] border-2 border-black rounded-xl flex items-center justify-center text-[#15803D]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Live Conversion Analytics</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Track camera scan counts, review formulation rates, and Google handoffs in real-time from your owner dashboard.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-9 h-9 bg-rose-50 border-2 border-black rounded-xl flex items-center justify-center text-rose-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Private Feedback Inbox</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Capture customer grievances privately before they turn into public complaints.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-9 h-9 bg-slate-100 border-2 border-black rounded-xl flex items-center justify-center text-[#15803D]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">100% Policy Compliant</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Zero review gating. Full compliance with Google Local Services and FTC guidelines ensures your profile stays safe.
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        PRICING CARD (₹1,999 Lifetime License)
        ========================================================================
      */}
      <section id="pricing" className="py-14 sm:py-20 px-4 sm:px-8 max-w-lg mx-auto text-center space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-black text-[#15803D] uppercase tracking-widest bg-[#dcfce7] px-3.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] inline-block">
            one-time lifetime deal
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            ₹1,999 Lifetime License
          </h2>
          <p className="text-xs font-medium text-slate-600">
            Zero monthly subscriptions. Instant activation for your business.
          </p>
        </div>

        <div className="bg-white border-[2.5px] border-black rounded-[30px] p-6 sm:p-7 space-y-5 text-left shadow-[6px_6px_0px_#000000]">
          <ul className="space-y-2.5 text-xs text-slate-800">
            {[
              "Unlimited QR Camera Scans & Google Handoffs",
              "Ready-to-Print 4\" x 6\" Acrylic Standee & Table Tent Studio",
              "AI Review Assistant (Gemini Flash + Zero-Cost NLP Engine)",
              "Custom Service Keywords & Experience Topics Manager",
              "Real-time KPI Conversion & Praised Aspects Dashboard",
              "Private Customer Feedback Inbox (Policy Compliant)",
              "Lifetime Software Access & All Future Updates",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span className="font-bold text-black">{f}</span>
              </li>
            ))}
          </ul>

          <CheckoutButton
            planType="lifetime"
            buttonText="Claim Lifetime Access for ₹1,999"
            className="w-full py-4 bg-[#15803D] hover:bg-[#166534] text-white rounded-full font-black text-sm flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all text-center cursor-pointer"
          />
          <p className="text-center text-[10.5px] text-slate-500 font-semibold">Instant activation via UPI, QR & Cards</p>
        </div>
      </section>

      {/* 
        ========================================================================
        FAQ ACCORDION
        ========================================================================
      */}
      <section id="faq" className="py-14 sm:py-20 px-4 sm:px-8 max-w-3xl mx-auto space-y-8 border-t-2 border-black/10">
        <div className="text-center space-y-2">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            got questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border-2 border-black overflow-hidden transition-all shadow-[3px_3px_0px_#000000]"
            >
              <button
                type="button"
                onClick={() => toggleFaq(i)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-black text-black hover:text-slate-700"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-black shrink-0 ml-2 transition-transform duration-200 ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-slate-700 leading-relaxed font-medium border-t-2 border-black/10 pt-3 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 
        ========================================================================
        FINAL CTA BANNER
        ========================================================================
      */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-white border-[3px] border-black rounded-[32px] sm:rounded-[36px] p-7 sm:p-14 space-y-5 shadow-[6px_6px_0px_#000000] sm:shadow-[8px_8px_0px_#000000] relative overflow-hidden">
          
          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-black tracking-tight leading-[1.15] relative z-10">
            Start Collecting 5-Star Reviews Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed relative z-10">
            Join hundreds of local businesses that transformed their Google Maps ranking with our 30-second review assistant.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#15803D] hover:bg-[#166534] text-white font-black rounded-full text-xs border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all text-center"
            >
              Get Started for ₹1,999 (Lifetime) →
            </Link>
            <Link
              href="/r/the-coffee-house"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-black border-2 border-black font-bold rounded-full text-xs shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all text-center"
            >
              View Customer Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        MINIMAL FOOTER
        ========================================================================
      */}
      <footer className="w-full max-w-[1080px] mx-auto px-4 sm:px-8 py-6 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-4 z-10 text-center sm:text-left">
        <p>© 2026 Welurik Review. Built for local businesses to collect authentic 5-star Google reviews.</p>
        <div className="flex flex-wrap items-center justify-center gap-4 font-semibold text-slate-700 text-xs">
          <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
          <Link href="/refund" className="hover:text-black transition-colors">Refunds</Link>
          <Link href="/login" className="hover:text-black transition-colors">Sign In</Link>
          <Link href="/r/the-coffee-house" className="hover:text-black transition-colors">Customer Demo</Link>
        </div>
      </footer>
    </div>
  );
}
