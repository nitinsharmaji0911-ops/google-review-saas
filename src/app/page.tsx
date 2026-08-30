"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
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
  ExternalLink,
  MapPin,
  Check
} from "lucide-react";
import WelurikLogo from "@/components/Logo";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      stepNumber: "1",
      stepTitle: "Scan & Rate",
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
      stepTitle: "Pick Tags",
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
      stepTitle: "AI Magic",
      header: "Step 3: 30-Second AI Generation",
      content: {
        review: "Had a wonderful morning at The Coffee House! The Specialty Latte was rich and delicious, and the warm croissants were fresh out of the oven. Super fast Wi-Fi and friendly staff make this my favorite spot in town!",
        actionText: "Copy & Open Google Review",
        copied: true,
      },
    },
    {
      stepNumber: "4",
      stepTitle: "Google 5★",
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
    }, 3600);
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
    <div className="min-h-screen bg-[#FDFDFE] text-slate-900 font-sans selection:bg-slate-900 selection:text-white relative overflow-x-hidden">
      {/* 
        ========================================================================
        AMBIENT NEON GLOW BACKGROUND
        ========================================================================
      */}
      <div className="absolute top-[5%] right-[-10%] sm:right-[2%] w-[380px] sm:w-[800px] h-[380px] sm:h-[800px] bg-gradient-to-tr from-violet-400/25 via-indigo-300/30 to-purple-400/20 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[8%] left-[-10%] sm:left-[6%] w-[300px] sm:w-[520px] h-[300px] sm:h-[520px] bg-gradient-to-br from-indigo-200/35 via-purple-200/25 to-pink-100/20 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[45%] left-[10%] sm:left-[20%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-indigo-100/30 rounded-full blur-[120px] sm:blur-[160px] pointer-events-none -z-10" />

      {/* 
        ========================================================================
        TOP NAVIGATION BAR (Mobile Responsive)
        ========================================================================
      */}
      <header className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-5 sm:py-7 flex items-center justify-between z-30 relative">
        <Link href="/" className="group hover:opacity-80 transition-opacity flex items-center">
          <WelurikLogo className="h-10 sm:h-[68px]" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-slate-950 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-950 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-slate-950 transition-colors">FAQ</a>
          <Link href="/dashboard" className="hover:text-slate-950 transition-colors">Demo Dashboard</Link>
        </nav>

        {/* Action / Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="text-[12px] sm:text-[13px] font-semibold text-slate-900 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Sign In
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 shadow-2xl space-y-3 z-40 animate-in fade-in slide-in-from-top-2">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 hover:text-slate-950"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 hover:text-slate-950"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 hover:text-slate-950"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 hover:text-slate-950"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-slate-900 bg-slate-100 rounded-xl"
              >
                Demo Dashboard
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-slate-950 rounded-xl shadow-sm"
              >
                Get Lifetime Access (₹1,999)
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 
        ========================================================================
        HERO SECTION (Optimized for Mobile & Desktop with Interactive Slideshow)
        ========================================================================
      */}
      <section className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 pt-4 sm:pt-6 pb-16 sm:pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          
          {/* LEFT COLUMN: Typography, Badge & CTA */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left pr-0 lg:pr-6">
            
            {/* Exact Match Frosted Glass Rating Pill Badge with Purple Ambient Glow */}
            <div className="relative inline-block mx-auto lg:mx-0">
              {/* Vibrant Purple Glow behind Star Avg */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-500/50 via-violet-400/50 to-indigo-400/40 rounded-full blur-md pointer-events-none" />
              <div 
                className="relative inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/70 transition-all duration-300 hover:scale-[1.02] select-none"
                style={{
                  background: "rgba(255, 255, 255, 0.45)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  boxShadow: "0 8px 24px -2px rgba(147, 51, 234, 0.25), 0 2px 6px rgba(0, 0, 0, 0.02), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
                }}
              >
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-slate-800 tracking-tight">4.9 Star Average</span>
                <div className="flex text-[#FBBF24] gap-[2px] sm:gap-[3px] items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-[12px] sm:w-[14px] h-[12px] sm:h-[14px] fill-[#FBBF24] text-[#FBBF24]" />
                  ))}
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-[34px] xs:text-[42px] sm:text-5xl lg:text-[64px] font-black text-slate-950 tracking-[-0.035em] leading-[1.08] sm:leading-[1.05]">
              Turn Happy Customers <br className="hidden xs:inline" />
              into 5-Star Reviews
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-[18px] text-slate-600 font-normal leading-[1.6] max-w-[530px] mx-auto lg:mx-0">
              Easily collect, manage, and showcase customer feedback to boost your Google rating and grow your business with 30-second AI review generation.
            </p>

            {/* Primary Action Button */}
            <div className="space-y-5 sm:space-y-6 pt-1 sm:pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-9 py-3.5 sm:py-4 bg-slate-950 hover:bg-slate-900 text-white rounded-full text-[13.5px] sm:text-[14px] font-bold shadow-[0_18px_35px_rgba(15,23,42,0.28)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Get Lifetime Access (₹1,999)
              </Link>

              {/* Micro Tags Line */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3.5 text-[12px] sm:text-[13px] text-slate-500 font-medium pt-1">
                <span>Auto-Feedback</span>
                <span className="text-slate-300">•</span>
                <span>Smart Prompts</span>
                <span className="text-slate-300">•</span>
                <span>Analytics</span>
              </div>
            </div>
          </div>

          {/* 
            ========================================================================
            RIGHT COLUMN: INTERACTIVE SLIDESHOW PHONE FRAME (4-STEP WALKTHROUGH)
            ========================================================================
          */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-4 sm:py-6 overflow-visible">
            
            {/* RICH PURPLE/VIOLET AMBIENT GLOW DIRECTLY BEHIND PHONE */}
            <div className="absolute w-[280px] sm:w-[440px] h-[400px] sm:h-[560px] bg-gradient-to-tr from-purple-600/40 via-violet-500/45 to-indigo-500/35 rounded-[50px] sm:rounded-[60px] blur-[60px] sm:blur-[80px] pointer-events-none -z-10 animate-pulse duration-1000" />
            <div className="absolute w-[240px] sm:w-[360px] h-[320px] sm:h-[480px] bg-purple-400/30 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none -z-10" />

            {/* PHONE DEVICE WITH BOLD BLACK OUTLINE & HARD DROP SHADOW */}
            <div 
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="w-full max-w-[290px] xs:max-w-[305px] sm:max-w-[320px] bg-white rounded-[44px] sm:rounded-[48px] border-[3px] sm:border-[3.5px] border-black relative z-10 select-none transition-transform duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px]"
              style={{
                boxShadow: "8px 10px 0px #000000",
              }}
            >
              {/* Dynamic Island Notch */}
              <div className="pt-3 pb-1 text-center">
                <div className="w-[76px] sm:w-[84px] h-[16px] sm:h-[18px] bg-black rounded-full mx-auto" />
              </div>

              {/* Inside Screen Graphic with Dynamic Slideshow */}
              <div className="p-3.5 sm:p-4 min-h-[460px] sm:min-h-[480px] flex flex-col justify-between text-left">
                
                {/* Screen Header Bar */}
                <div className="flex items-center justify-between pb-2.5 pt-0.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold">
                      W
                    </div>
                    <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-900 tracking-tight truncate max-w-[160px]">
                      {slides[currentSlide].header}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                    {currentSlide + 1}/4
                  </span>
                </div>

                {/* DYNAMIC SLIDE CONTENT */}
                <div className="my-auto py-1">
                  {/* SLIDE 1: SCAN & RATE */}
                  {currentSlide === 0 && (
                    <div className="space-y-3.5 animate-in fade-in zoom-in-95 duration-300">
                      <div className="text-center">
                        <span className="text-[9px] font-medium text-slate-400">Step 1 • Table Standee Scan</span>
                      </div>
                      <div className="bg-[#F4F5F9] p-3.5 rounded-2xl rounded-tl-sm space-y-2 border border-slate-200/60">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5">
                            S
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-bold text-slate-900">Hi Sarah!</p>
                            <p className="text-[10px] text-slate-600">How was your coffee & visit today?</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-3 text-center">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Rate Your Visit</span>
                        <div className="flex justify-center gap-1.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400 transition-transform hover:scale-110" />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                          5 Stars • Excellent
                        </span>
                        <button 
                          onClick={() => setCurrentSlide(1)}
                          className="w-full py-2.5 bg-slate-950 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm"
                        >
                          Next: Pick Highlights <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SLIDE 2: PICK TAGS */}
                  {currentSlide === 1 && (
                    <div className="space-y-3.5 animate-in fade-in zoom-in-95 duration-300">
                      <div className="text-center">
                        <span className="text-[9px] font-medium text-slate-400">Step 2 • Tap Highlights</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-900">What did you enjoy most?</p>
                        <p className="text-[9.5px] text-slate-500">Tap pills to weave keywords into your review:</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 py-1">
                        {[
                          { name: "☕ Specialty Latte", sel: true },
                          { name: "🥐 Warm Croissant", sel: true },
                          { name: "⚡ Fast Free Wi-Fi", sel: true },
                          { name: "😊 Friendly Staff", sel: true },
                          { name: "🎵 Chill Vibes", sel: false },
                        ].map((t, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 ${
                              t.sel
                                ? "bg-slate-950 text-white border-slate-950"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {t.name} {t.sel && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={() => setCurrentSlide(2)}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Generate Review with AI
                      </button>
                    </div>
                  )}

                  {/* SLIDE 3: AI MAGIC */}
                  {currentSlide === 2 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                      <div className="text-center">
                        <span className="text-[9px] font-medium text-slate-400">Step 3 • AI Assistant Magic</span>
                      </div>
                      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] font-bold text-indigo-900 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" /> AI Generated Review:
                          </span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-800 leading-relaxed italic bg-white/80 p-2.5 rounded-xl border border-indigo-100/80">
                          "Had a wonderful morning at The Coffee House! The Specialty Latte was rich and delicious, and the warm croissants were fresh out of the oven. Super fast Wi-Fi and friendly staff make this my favorite spot!"
                        </p>
                      </div>

                      <button 
                        onClick={() => setCurrentSlide(3)}
                        className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy & Open Google Maps
                      </button>
                    </div>
                  )}

                  {/* SLIDE 4: GOOGLE MAPS 5★ */}
                  {currentSlide === 3 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                      <div className="text-center">
                        <span className="text-[9px] font-medium text-slate-400">Step 4 • Posted on Google Maps</span>
                      </div>
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                            S
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10.5px] font-bold text-slate-900">Sarah Jenkins</p>
                            <p className="text-[8.5px] text-slate-400">Local Guide • 42 reviews</p>
                          </div>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[9.5px] text-slate-700 leading-relaxed">
                          The Coffee House is our favorite spot in town! Incredible Specialty Latte, warm fresh croissants, and awesome staff. 10/10 recommend!
                        </p>
                      </div>

                      <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-amber-900 flex items-center justify-center gap-1">
                          🏆 Ranked #1 in Google Maps Local Pack
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Step Pills Bar for Direct Manual Control */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  {slides.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-[9px] font-bold transition-all text-center ${
                        currentSlide === idx
                          ? "bg-slate-950 text-white shadow-xs scale-105"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {s.stepTitle}
                    </button>
                  ))}
                </div>

              </div>

              {/* Floating Bottom Badge with Black Border & Hard Shadow */}
              <div 
                className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-6 bg-white border-2 border-black rounded-full px-3 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 z-20 shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000]"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[9.5px] sm:text-[11px] font-bold text-slate-900 whitespace-nowrap">
                  Reviews sent: 1,240+
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 
        ========================================================================
        TRUSTED BY LOCAL BUSINESSES
        ========================================================================
      */}
      <section className="py-10 sm:py-12 border-y border-slate-100 bg-white/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center space-y-4">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
            Trusted by 250+ Cafés, Salons, Clinics, Restaurants & Auto Studios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-12 text-slate-400 text-xs sm:text-sm font-semibold">
            <span className="flex items-center gap-1.5">☕ Specialty Cafés</span>
            <span className="flex items-center gap-1.5">💇‍♀️ Luxury Salons</span>
            <span className="flex items-center gap-1.5">🍽️ Fine Dining</span>
            <span className="flex items-center gap-1.5">🦷 Healthcare</span>
            <span className="flex items-center gap-1.5">🚗 Auto Studios</span>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        HOW IT WORKS (3-Step Frictionless Flow)
        ========================================================================
      */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto space-y-12 sm:space-y-16">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
            Zero Friction
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Eliminate customer writer's block and make leaving 5-star reviews effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-3.5 relative group hover:border-slate-300 transition-all">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shadow-sm">
              1
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-950">Scan Table Standee</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Place sleek 4" x 6" acrylic standees on tables, reception counters, or billing desks. Customers simply scan with their phone camera.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-3.5 relative group hover:border-slate-300 transition-all">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shadow-sm">
              2
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-950">Tap What They Loved</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Customers tap simple pills (e.g. "Great Coffee", "Fast Wi-Fi"). AI instantly crafts a genuine, polite, keyword-rich 5-star review.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-3.5 relative group hover:border-slate-300 transition-all">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shadow-sm">
              3
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-950">1-Tap Google Post</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The review copies to clipboard and instantly redirects to your Google Business profile. The customer pastes and submits in 5 seconds!
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        BENTO GRID FEATURES
        ========================================================================
      */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12 sm:space-y-16 border-t border-slate-100">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Powerful Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Everything You Need To Dominate Google Maps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Bento 1 */}
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-9 sm:w-10 h-9 sm:h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
              <Printer className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Standee & Table Tent Studio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Print ready 4" x 6" acrylic standee templates, table tent foldables, and register badges with crisp vector QR codes.
            </p>
          </div>

          {/* Bento 2 */}
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-9 sm:w-10 h-9 sm:h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Polite Sentiment Modulation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every review maintains a courteous, dignified tone. Negative 1-star ratings produce polite, constructive feedback.
            </p>
          </div>

          {/* Bento 3 */}
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-9 sm:w-10 h-9 sm:h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
              <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Target Keyword SEO Booster</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Naturally weaved service keywords signal Google's ranking engine to place your business in the Top 3 Local Map Pack.
            </p>
          </div>

          {/* Bento 4 */}
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-9 sm:w-10 h-9 sm:h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
              <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Live Conversion Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track camera scan counts, review formulation rates, and Google handoffs in real-time from your owner dashboard.
            </p>
          </div>

          {/* Bento 5 */}
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-9 sm:w-10 h-9 sm:h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100">
              <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Private Feedback Inbox</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Capture customer grievances and operational issues privately before they turn into public complaints.
            </p>
          </div>

          {/* Bento 6 */}
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-9 sm:w-10 h-9 sm:h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
              <ShieldCheck className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">100% Policy Compliant</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero review gating. Full compliance with Google Local Services and FTC guidelines ensures your profile stays safe.
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        PRICING SECTION (Mobile Responsive)
        ========================================================================
      */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-8 max-w-xl mx-auto text-center space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
            One-Time Lifetime Deal
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            ₹1,999 Lifetime License
          </h2>
          <p className="text-xs text-slate-500">
            Zero monthly subscriptions. Instant activation for your business.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 space-y-6 sm:space-y-7 text-left shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-4 sm:pb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Full Business License</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Everything needed to grow reviews</p>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-slate-950">₹1,999</span>
              <span className="block text-[9.5px] sm:text-[10px] text-slate-400">One-time payment</span>
            </div>
          </div>

          <ul className="space-y-2.5 sm:space-y-3 text-xs text-slate-700">
            {[
              "Unlimited QR Camera Scans & Google Handoffs",
              "Ready-to-Print 4\" x 6\" Acrylic Standee & Table Tent Studio",
              "AI Review Assistant (Gemini Flash + Zero-Cost NLP Engine)",
              "Custom Service Keywords & Experience Topics Manager",
              "Real-time KPI Conversion & Praised Aspects Dashboard",
              "Private Customer Feedback Inbox (Policy Compliant)",
              "Lifetime Software Access & All Future Updates",
            ].map((f) => (
              <li key={f} className="flex items-start sm:items-center gap-2 sm:gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                <span className="font-medium text-slate-800">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="w-full py-3.5 sm:py-4 bg-slate-950 hover:bg-slate-900 text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-[0_12px_24px_rgba(15,23,42,0.2)] hover:scale-[1.01] active:scale-[0.98] transition-all text-center"
          >
            Claim Lifetime Access Now <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </Link>
          <p className="text-center text-[10px] text-slate-400">Instant setup in under 2 minutes</p>
        </div>
      </section>

      {/* 
        ========================================================================
        FAQ ACCORDION
        ========================================================================
      */}
      <section id="faq" className="py-16 sm:py-20 px-4 sm:px-8 max-w-3xl mx-auto space-y-8 sm:space-y-12 border-t border-slate-100">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-3.5">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFaq(i)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:text-slate-700"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
                    openFaq === i ? "rotate-180 text-slate-900" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-slate-600 leading-relaxed font-normal animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 
        ========================================================================
        FINAL CTA BANNER (Light Glassmorphic Apple Aesthetic)
        ========================================================================
      */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-[28px] sm:rounded-[40px] p-8 sm:p-14 space-y-5 sm:space-y-6 shadow-[0_25px_60px_rgba(147,51,234,0.09),0_4px_16px_rgba(0,0,0,0.03)] relative overflow-hidden">
          {/* Subtle Ambient Violet/Purple Lighting Halos */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-violet-300/35 via-indigo-200/40 to-purple-300/30 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-200/30 rounded-full blur-[80px] pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-slate-950 tracking-tight leading-[1.15] relative z-10">
            Start Collecting 5-Star Reviews Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-normal leading-relaxed relative z-10">
            Join hundreds of local businesses that transformed their Google Maps ranking with our 30-second review assistant.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-full text-xs shadow-[0_12px_28px_rgba(15,23,42,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              Get Started for ₹1,999 (Lifetime)
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 sm:py-4 bg-white/90 hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-semibold rounded-full text-xs shadow-xs hover:border-slate-300 transition-all text-center"
            >
              View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        MINIMAL FOOTER
        ========================================================================
      */}
      <footer className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-6 sm:py-8 border-t border-slate-100/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 z-10 text-center sm:text-left">
        <p>© 2026 Welurik Review. Built for local businesses to collect authentic 5-star Google reviews.</p>
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 font-medium text-slate-500">
          <Link href="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          <Link href="/r/the-coffee-house" target="_blank" className="hover:text-slate-900 transition-colors">Live Funnel</Link>
        </div>
      </footer>
    </div>
  );
}
