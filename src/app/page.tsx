"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  Sparkles,
  CheckCircle2,
  Printer,
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
      a: "No. Welurik Review is 100% compliant with Google policies. All customers have full freedom to leave a public Google review. We also provide a direct private feedback option for operational issues.",
    },
    {
      q: "How does this boost my Google Maps (GMB) ranking?",
      a: "Google prioritizes businesses with frequent, keyword-rich reviews mentioning specific services (e.g., 'Specialty Latte', 'Ceramic Coating'). Our AI naturally weaves these tags into the review to signal local authority.",
    },
    {
      q: "Are there any monthly subscription fees or AI API bills?",
      a: "No. The license is a one-time payment of ₹1,999 for lifetime business access. No monthly charges, no recurring fees, and zero hidden API bills.",
    },
  ];

  return (
    <div className="neo-canvas-bg min-h-screen text-[#0C0E14] font-sans selection:bg-[#15803D] selection:text-white relative overflow-x-hidden">
      
      {/* Active Neo-Grid Background */}
      <div className="neo-grid-overlay absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-75" />
      <div className="absolute top-[2%] right-[5%] w-[400px] h-[400px] bg-[#bbf7d0]/40 rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-[10%] left-[2%] w-[350px] h-[350px] bg-[#dcfce7]/50 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* 
        ========================================================================
        FLOATING STADIUM PILL NAVBAR
        ========================================================================
      */}
      <div className="w-full max-w-[1080px] mx-auto px-4 pt-4 sm:pt-6 z-40 relative">
        <header className="w-full bg-white border-2 border-black rounded-full px-4 sm:px-6 py-2 sm:py-2.5 shadow-[4px_4px_0px_#000000] flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="group hover:opacity-90 transition-opacity flex items-center">
            <WelurikLogo className="h-8 sm:h-10" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold text-slate-700">
            <a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a>
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
            <Link href="/r/the-coffee-house" className="text-[#15803D] font-bold hover:text-[#166534] transition-colors">Live Demo</Link>
          </nav>

          {/* Auth & Action */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/login"
              className="text-[12.5px] sm:text-[13px] font-bold text-black hover:text-slate-600 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="hidden md:inline-flex text-[13px] font-bold text-white bg-black hover:bg-neutral-800 px-5 py-2 rounded-full border border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all"
            >
              Get Lifetime Access
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-black hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_#000000] space-y-3 z-50 animate-in fade-in slide-in-from-top-2">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-bold text-black"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-bold text-black"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-bold text-black"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-bold text-black"
            >
              FAQ
            </a>
            <Link
              href="/r/the-coffee-house"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-bold text-[#15803D]"
            >
              Customer Demo Funnel
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-bold text-black"
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
        HIGH-CONVERTING HERO SECTION (Focused & Punchy)
        ========================================================================
      */}
      <section className="w-full max-w-[1140px] mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-12 sm:pb-16 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left pr-0 lg:pr-4">
            
            {/* 4.9 Star Average Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-black bg-white shadow-[3px_3px_0px_#000000] text-xs font-bold text-black select-none">
              <span className="text-[12px] font-black text-black">4.9 Star Average</span>
              <div className="flex text-amber-400 gap-0.5 items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            {/* Punchy Headline */}
            <h1 className="text-[34px] xs:text-[44px] sm:text-5xl lg:text-[58px] font-black text-black tracking-[-0.035em] leading-[1.08] sm:leading-[1.05]">
              Turn Happy Customers <br className="hidden xs:inline" />
              into <span className="text-[#15803D] underline decoration-4 decoration-[#15803D]/30">5-Star Reviews</span>
            </h1>

            {/* Focused 1-Sentence Subtitle */}
            <p className="text-sm sm:text-base text-slate-700 font-medium leading-[1.6] max-w-[500px] mx-auto lg:mx-0">
              AI-powered QR standees that eliminate customer writer's block and multiply your Google Maps reviews in 30 seconds.
            </p>

            {/* High-Contrast CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-full text-[13.5px] sm:text-[14px] font-black border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              >
                Get Lifetime Access (₹1,999) <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/r/the-coffee-house"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 bg-white hover:bg-slate-50 text-black rounded-full text-[13.5px] sm:text-[14px] font-bold border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-black text-black" /> Try Customer Demo
              </Link>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[12px] text-slate-700 font-bold pt-1">
              <span className="bg-white border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_#000000]">Standee Studio</span>
              <span className="bg-white border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_#000000]">Smart Keywords</span>
              <span className="bg-white border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_#000000]">Live Analytics</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Visual Proof Phone Mockup */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-2 sm:py-4">
            
            <div 
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="w-full max-w-[290px] sm:max-w-[315px] bg-white rounded-[44px] border-[3.5px] border-black relative z-10 select-none shadow-[8px_8px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_#000000] transition-all"
            >
              {/* Dynamic Island */}
              <div className="pt-3 pb-1 text-center">
                <div className="w-[82px] h-[17px] bg-black rounded-full mx-auto" />
              </div>

              {/* Inside Screen */}
              <div className="p-3.5 sm:p-4 min-h-[440px] flex flex-col justify-between text-left">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b-2 border-black/10">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-black">
                      W
                    </div>
                    <span className="text-[11px] font-black text-black tracking-tight truncate max-w-[155px]">
                      {slides[currentSlide].header}
                    </span>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-[#dcfce7] text-[#15803D] border border-black rounded-full">
                    {currentSlide + 1}/4
                  </span>
                </div>

                {/* Slides */}
                <div className="my-auto py-1">
                  {currentSlide === 0 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="bg-[#FAF9F5] p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1">
                        <p className="text-[11px] font-black text-black">Hi Sarah! 👋</p>
                        <p className="text-[10px] text-slate-600">How was your visit today?</p>
                      </div>

                      <div className="bg-white p-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2 text-center">
                        <div className="flex justify-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-[#15803D] bg-[#dcfce7] border border-black px-2.5 py-0.5 rounded-full inline-block">
                          5 Stars • Excellent
                        </span>
                        <button 
                          onClick={() => setCurrentSlide(1)}
                          className="w-full py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1 shadow-sm"
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
                            className="text-[9.5px] font-bold px-2.5 py-1 rounded-xl border-2 border-black flex items-center gap-1 bg-[#dcfce7] text-[#15803D] shadow-[1px_1px_0px_#000000]"
                          >
                            {t.name} <Check className="w-2.5 h-2.5 text-[#15803D]" />
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={() => setCurrentSlide(2)}
                        className="w-full py-2.5 bg-[#15803D] text-white border-2 border-black rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000000]"
                      >
                        <Sparkles className="w-3 h-3" /> Generate Review with AI
                      </button>
                    </div>
                  )}

                  {currentSlide === 2 && (
                    <div className="space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="bg-[#FAF9F5] border-2 border-black rounded-2xl p-3 space-y-1.5 shadow-[2px_2px_0px_#000000]">
                        <span className="text-[9.5px] font-black text-black flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#15803D]" /> AI Review Generated:
                        </span>
                        <p className="text-[9.5px] text-slate-800 leading-relaxed italic bg-white p-2 rounded-xl border border-black/20">
                          "Wonderful visit at The Coffee House! The Specialty Latte was delicious, and the croissants were super fresh. 10/10 recommend!"
                        </p>
                      </div>

                      <button 
                        onClick={() => setCurrentSlide(3)}
                        className="w-full py-2.5 bg-[#15803D] text-white border-2 border-black rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1 shadow-[2px_2px_0px_#000000]"
                      >
                        <Copy className="w-3 h-3" /> Copy & Open Google Maps
                      </button>
                    </div>
                  )}

                  {currentSlide === 3 && (
                    <div className="space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[2px_2px_0px_#000000] space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-black">
                            S
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black text-black">Sarah Jenkins</p>
                            <p className="text-[8px] text-slate-500">Local Guide • 5 Stars</p>
                          </div>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-800 leading-relaxed">
                          The Coffee House is our favorite spot! Incredible latte & croissants!
                        </p>
                      </div>

                      <div className="p-2 bg-[#dcfce7] border-2 border-black rounded-xl text-center shadow-[1px_1px_0px_#000000]">
                        <span className="text-[9.5px] font-black text-[#15803D]">
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
                      className={`flex-1 py-1 px-0.5 rounded-lg text-[8.5px] font-black transition-all text-center border ${
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
        HOW IT WORKS (3 Quick Steps)
        ========================================================================
      */}
      <section id="how-it-works" className="py-12 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black text-[#15803D] uppercase tracking-widest bg-[#dcfce7] px-3.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] inline-block">
            zero friction
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            How It Works in 3 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 sm:p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-10 h-10 bg-black text-white border-2 border-black rounded-xl flex items-center justify-center font-black text-sm">
              1
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Scan Table Standee</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Place sleek 4" x 6" standees on tables. Customers scan with their phone camera in 1 second.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-10 h-10 bg-[#15803D] text-white border-2 border-black rounded-xl flex items-center justify-center font-black text-sm">
              2
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Tap What They Loved</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Customers tap simple highlights. AI instantly crafts a genuine, keyword-rich 5-star review.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-10 h-10 bg-black text-white border-2 border-black rounded-xl flex items-center justify-center font-black text-sm">
              3
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">1-Tap Google Post</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              The review copies to clipboard and opens Google Maps. The customer pastes and submits instantly!
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        CORE FEATURES (3 Essential Pillars)
        ========================================================================
      */}
      <section id="features" className="py-12 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-8 border-t-2 border-black/10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Built To Dominate Google Maps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-9 h-9 bg-slate-100 border-2 border-black rounded-xl flex items-center justify-center text-black">
              <Printer className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Print-Ready Standee Studio</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Generate ready-to-print 4" x 6" acrylic standees, table tents, and counter stickers with your custom QR.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-9 h-9 bg-amber-50 border-2 border-black rounded-xl flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Target Keyword SEO Booster</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Automatically weaves your configured service keywords to signal local relevance to Google's ranking engine.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2.5">
            <div className="w-9 h-9 bg-[#dcfce7] border-2 border-black rounded-xl flex items-center justify-center text-[#15803D]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">100% Policy Compliant</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Zero review gating. Full Google compliance with a private feedback inbox for operational issues.
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        PRICING CARD (₹1,999 Lifetime Deal)
        ========================================================================
      */}
      <section id="pricing" className="py-12 sm:py-16 px-4 sm:px-8 max-w-lg mx-auto text-center space-y-6">
        <div className="space-y-1.5">
          <span className="text-xs font-black text-[#15803D] uppercase tracking-widest bg-[#dcfce7] px-3.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] inline-block">
            lifetime access
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            ₹1,999 One-Time Payment
          </h2>
          <p className="text-xs font-medium text-slate-600">
            Zero monthly subscriptions. Instant activation for your business.
          </p>
        </div>

        <div className="bg-white border-[2.5px] border-black rounded-[30px] p-6 sm:p-7 space-y-5 text-left shadow-[6px_6px_0px_#000000]">
          <ul className="space-y-2.5 text-xs text-slate-800">
            {[
              "Unlimited QR Camera Scans & Google Handoffs",
              "Print-Ready 4\" x 6\" Acrylic Standee & Table Tent Studio",
              "30-Second AI Review Formulation Engine",
              "Custom Service Keywords & Topics Manager",
              "Private Customer Grievance Inbox (Google Compliant)",
              "Lifetime Access & All Future Updates",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span className="font-bold text-black">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="w-full py-3.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-full font-black text-xs flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all text-center"
          >
            Claim Lifetime Access Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 
        ========================================================================
        TOP 3 FAQS
        ========================================================================
      */}
      <section id="faq" className="py-12 sm:py-16 px-4 sm:px-8 max-w-2xl mx-auto space-y-6 border-t-2 border-black/10">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border-2 border-black overflow-hidden transition-all shadow-[3px_3px_0px_#000000]"
            >
              <button
                type="button"
                onClick={() => toggleFaq(i)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-black text-black hover:text-slate-700"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-black shrink-0 ml-2 transition-transform duration-200 ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-slate-700 leading-relaxed font-medium border-t-2 border-black/10 pt-2.5 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 
        ========================================================================
        MINIMAL FOOTER
        ========================================================================
      */}
      <footer className="w-full max-w-[1080px] mx-auto px-4 sm:px-8 py-6 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-4 z-10 text-center sm:text-left">
        <p>© 2026 Welurik Review. Authentic 5-star Google review growth for local businesses.</p>
        <div className="flex flex-wrap items-center justify-center gap-5 font-bold text-black">
          <Link href="/login" className="hover:text-slate-600 transition-colors">Sign In</Link>
          <Link href="/r/the-coffee-house" className="hover:text-slate-600 transition-colors">Customer Demo</Link>
          <Link href="/dashboard" className="hover:text-slate-600 transition-colors">Admin Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
