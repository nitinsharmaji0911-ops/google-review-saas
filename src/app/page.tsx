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

  // Auto-play slideshow every 3.6 seconds
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
    <div className="neo-canvas-bg min-h-screen text-[#0C0E14] font-sans selection:bg-[#15803D] selection:text-white relative overflow-x-hidden">
      
      {/* 
        ========================================================================
        ACTIVE ARCHITECTURAL NEO-GRID & AMBIENT GLOW SYSTEM
        ========================================================================
      */}
      <div className="neo-grid-overlay absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-75" />
      <div className="absolute top-[3%] right-[-5%] sm:right-[5%] w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-[#bbf7d0]/40 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[8%] left-[-10%] sm:left-[2%] w-[300px] sm:w-[550px] h-[300px] sm:h-[550px] bg-[#dcfce7]/50 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[48%] right-[8%] w-[320px] sm:w-[520px] h-[320px] sm:h-[520px] bg-[#bbf7d0]/30 rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[5%] w-[340px] sm:w-[560px] h-[340px] sm:h-[560px] bg-[#dcfce7]/40 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* 
        ========================================================================
        FLOATING STADIUM PILL NAVBAR (Neo-Brutalist Theme)
        ========================================================================
      */}
      <div className="w-full max-w-[1080px] mx-auto px-4 pt-4 sm:pt-6 z-40 relative">
        <header className="w-full bg-white border-2 border-black rounded-full px-4 sm:px-6 py-2 sm:py-2.5 shadow-[4px_4px_0px_#000000] flex items-center justify-between">
          
          {/* Clean Welurik Review Brand Logo */}
          <Link href="/" className="group hover:opacity-90 transition-opacity flex items-center">
            <WelurikLogo className="h-7 sm:h-9" />
          </Link>

          {/* Clean Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold text-slate-700">
            <a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a>
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
            <Link href="/dashboard" className="hover:text-black transition-colors">Demo</Link>
          </nav>

          {/* Action / Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-block text-[13px] font-bold text-black hover:text-slate-600 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="text-[12.5px] sm:text-[13px] font-bold text-white bg-black hover:bg-neutral-800 px-4 sm:px-5 py-2 rounded-full border border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all"
            >
              Get Started
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
            <div className="pt-2 border-t-2 border-black/10 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-black bg-slate-100 border border-black rounded-full"
              >
                Sign In
              </Link>
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
        HERO SECTION (Original Content with Neo-Brutalist Theme)
        ========================================================================
      */}
      <section className="w-full max-w-[1140px] mx-auto px-4 sm:px-8 pt-8 sm:pt-14 pb-16 sm:pb-24 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Typography, Badge & CTA (100% Original Content) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-center lg:text-left pr-0 lg:pr-4">
            
            {/* 4.9 Star Average Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border-2 border-black bg-white shadow-[3px_3px_0px_#000000] text-xs font-bold text-black select-none">
              <span className="text-[12.5px] font-black text-black">4.9 Star Average</span>
              <div className="flex text-amber-400 gap-0.5 items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            {/* Original Main Headline */}
            <h1 className="text-[36px] xs:text-[46px] sm:text-5xl lg:text-[62px] font-black text-black tracking-[-0.035em] leading-[1.08] sm:leading-[1.05]">
              Turn Happy Customers <br className="hidden xs:inline" />
              into <span className="text-[#15803D] underline decoration-4 decoration-[#15803D]/30">5-Star Reviews</span>
            </h1>

            {/* Original Subtitle */}
            <p className="text-sm sm:text-base lg:text-[17px] text-slate-700 font-medium leading-[1.6] max-w-[530px] mx-auto lg:mx-0">
              Easily collect, manage, and showcase customer feedback to boost your Google rating and grow your business with 30-second AI review generation.
            </p>

            {/* Neo-Brutalist CTA Button Lockup */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-9 py-3.5 sm:py-4 bg-[#15803D] hover:bg-[#166534] text-white rounded-full text-[13.5px] sm:text-[14px] font-black border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              >
                Get Lifetime Access (₹1,999) <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-white hover:bg-slate-50 text-black rounded-full text-[13.5px] sm:text-[14px] font-bold border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-black text-black" /> View Live Demo
              </Link>
            </div>

            {/* Original Micro Tags Line */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 text-[12.5px] text-slate-600 font-bold pt-1">
              <span className="bg-white border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_#000000]">Auto-Feedback</span>
              <span className="bg-white border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_#000000]">Smart Prompts</span>
              <span className="bg-white border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_#000000]">Analytics</span>
            </div>
          </div>

          {/* 
            ========================================================================
            RIGHT COLUMN: INTERACTIVE 4-STEP SLIDESHOW PHONE FRAME
            ========================================================================
          */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-4 sm:py-6">
            
            {/* Phone Device with Neo-Brutalist 3.5px Black Border & Offset Shadow */}
            <div 
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="w-full max-w-[295px] xs:max-w-[310px] sm:max-w-[325px] bg-white rounded-[44px] sm:rounded-[48px] border-[3.5px] border-black relative z-10 select-none shadow-[8px_8px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_#000000] transition-all"
            >
              {/* Dynamic Island Notch */}
              <div className="pt-3.5 pb-1 text-center">
                <div className="w-[82px] sm:w-[88px] h-[17px] sm:h-[19px] bg-black rounded-full mx-auto" />
              </div>

              {/* Inside Screen Container */}
              <div className="p-3.5 sm:p-4 min-h-[460px] sm:min-h-[480px] flex flex-col justify-between text-left">
                
                {/* Screen Top Header */}
                <div className="flex items-center justify-between pb-2.5 pt-0.5 border-b-2 border-black/10">
                  <div className="flex items-center gap-2">
                    <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-black text-white flex items-center justify-center text-[9px] sm:text-[10px] font-black">
                      W
                    </div>
                    <span className="text-[11px] font-black text-black tracking-tight truncate max-w-[155px]">
                      {slides[currentSlide].header}
                    </span>
                  </div>
                  <span className="text-[9.5px] font-black px-2 py-0.5 bg-[#dcfce7] text-[#15803D] border border-black rounded-full">
                    {currentSlide + 1}/4
                  </span>
                </div>

                {/* DYNAMIC SLIDES */}
                <div className="my-auto py-1">
                  {/* SLIDE 1: SCAN & RATE */}
                  {currentSlide === 0 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Step 1 • Table Standee Scan</span>
                      </div>
                      <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-1.5">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                            S
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-black">Hi Sarah!</p>
                            <p className="text-[10px] text-slate-600">How was your coffee & visit today?</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-2.5 text-center">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">Rate Your Visit</span>
                        <div className="flex justify-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10.5px] font-bold text-[#15803D] bg-[#dcfce7] border border-black px-2.5 py-0.5 rounded-full inline-block">
                          5 Stars • Excellent
                        </span>
                        <button 
                          onClick={() => setCurrentSlide(1)}
                          className="w-full py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm"
                        >
                          Next: Pick Highlights <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SLIDE 2: PICK TAGS */}
                  {currentSlide === 1 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Step 2 • Tap Highlights</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-black">What did you enjoy most?</p>
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
                            className={`text-[9.5px] font-bold px-2.5 py-1.5 rounded-xl border-2 border-black flex items-center gap-1 ${
                              t.sel
                                ? "bg-[#dcfce7] text-[#15803D] shadow-[1px_1px_0px_#000000]"
                                : "bg-white text-slate-700"
                            }`}
                          >
                            {t.name} {t.sel && <Check className="w-2.5 h-2.5 text-[#15803D]" />}
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={() => setCurrentSlide(2)}
                        className="w-full py-2.5 bg-[#15803D] hover:bg-[#166534] text-white border-2 border-black rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000]"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Generate Review with AI
                      </button>
                    </div>
                  )}

                  {/* SLIDE 3: AI MAGIC */}
                  {currentSlide === 2 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Step 3 • AI Assistant Magic</span>
                      </div>
                      <div className="bg-[#FAF9F5] border-2 border-black rounded-2xl p-3 space-y-2 shadow-[2px_2px_0px_#000000]">
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] font-black text-black flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#15803D]" /> AI Generated Review:
                          </span>
                          <span className="text-[9px] font-black text-[#15803D] bg-[#dcfce7] border border-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-800 leading-relaxed italic bg-white p-2.5 rounded-xl border border-black/20">
                          "Had a wonderful morning at The Coffee House! The Specialty Latte was rich and delicious, and the warm croissants were fresh out of the oven. Super fast Wi-Fi and friendly staff make this my favorite spot!"
                        </p>
                      </div>

                      <button 
                        onClick={() => setCurrentSlide(3)}
                        className="w-full py-2.5 bg-[#15803D] hover:bg-[#166534] text-white border-2 border-black rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000]"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy & Open Google Maps
                      </button>
                    </div>
                  )}

                  {/* SLIDE 4: GOOGLE MAPS 5★ */}
                  {currentSlide === 3 && (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Step 4 • Posted on Google Maps</span>
                      </div>
                      <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[2px_2px_0px_#000000] space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-black">
                            S
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10.5px] font-black text-black">Sarah Jenkins</p>
                            <p className="text-[8.5px] text-slate-500 font-medium">Local Guide • 42 reviews</p>
                          </div>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[9.5px] text-slate-800 leading-relaxed">
                          The Coffee House is our favorite spot in town! Incredible Specialty Latte, warm fresh croissants, and awesome staff. 10/10 recommend!
                        </p>
                      </div>

                      <div className="p-2 bg-[#dcfce7] border-2 border-black rounded-xl text-center shadow-[1px_1px_0px_#000000]">
                        <span className="text-[9.5px] font-black text-[#15803D] flex items-center justify-center gap-1">
                          🏆 Ranked #1 in Google Maps Local Pack
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Step Pills Bar */}
                <div className="pt-2 border-t-2 border-black/10 flex items-center justify-between gap-1">
                  {slides.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-[9px] font-black transition-all text-center border ${
                        currentSlide === idx
                          ? "bg-black text-white border-black shadow-[1px_1px_0px_#000000]"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {s.stepTitle}
                    </button>
                  ))}
                </div>

              </div>

              {/* Floating Bottom Pill Badge */}
              <div 
                className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-4 bg-white border-2 border-black rounded-full px-3.5 py-1 flex items-center gap-1.5 z-20 shadow-[3px_3px_0px_#000000]"
              >
                <div className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse shrink-0" />
                <span className="text-[10px] font-black text-black whitespace-nowrap">
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
      <section className="py-8 sm:py-10 border-y-2 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center space-y-3">
          <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-500">
            Trusted by 250+ Cafés, Salons, Clinics, Restaurants & Auto Studios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10 text-black text-xs sm:text-sm font-bold">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-1 transition-all space-y-3.5">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-black text-white border-2 border-black rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shadow-[2px_2px_0px_#000000]">
              1
            </div>
            <h3 className="text-base sm:text-lg font-black text-black">Scan Table Standee</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Place sleek 4" x 6" acrylic standees on tables, reception counters, or billing desks. Customers simply scan with their phone camera.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-1 transition-all space-y-3.5">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#15803D] text-white border-2 border-black rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shadow-[2px_2px_0px_#000000]">
              2
            </div>
            <h3 className="text-base sm:text-lg font-black text-black">Tap What They Loved</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Customers tap simple pills (e.g. "Great Coffee", "Fast Wi-Fi"). AI instantly crafts a genuine, polite, keyword-rich 5-star review.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-1 transition-all space-y-3.5">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-black text-white border-2 border-black rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shadow-[2px_2px_0px_#000000]">
              3
            </div>
            <h3 className="text-base sm:text-lg font-black text-black">1-Tap Google Post</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
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
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12 sm:space-y-16 border-t-2 border-black/10">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            powerful architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            Everything You Need To Dominate Google Maps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Bento 1 */}
          <div className="bg-white p-6 sm:p-7 rounded-[26px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-0.5 transition-all space-y-3">
            <div className="w-10 h-10 bg-slate-100 border-2 border-black rounded-xl flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
              <Printer className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Standee & Table Tent Studio</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Print ready 4" x 6" acrylic standee templates, table tent foldables, and register badges with crisp vector QR codes.
            </p>
          </div>

          {/* Bento 2 */}
          <div className="bg-white p-6 sm:p-7 rounded-[26px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-0.5 transition-all space-y-3">
            <div className="w-10 h-10 bg-[#dcfce7] border-2 border-black rounded-xl flex items-center justify-center text-[#15803D] shadow-[2px_2px_0px_#000000]">
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Polite Sentiment Modulation</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Every review maintains a courteous, dignified tone. Negative 1-star ratings produce polite, constructive feedback.
            </p>
          </div>

          {/* Bento 3 */}
          <div className="bg-white p-6 sm:p-7 rounded-[26px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-0.5 transition-all space-y-3">
            <div className="w-10 h-10 bg-amber-50 border-2 border-black rounded-xl flex items-center justify-center text-amber-600 shadow-[2px_2px_0px_#000000]">
              <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Target Keyword SEO Booster</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Naturally weaved service keywords signal Google's ranking engine to place your business in the Top 3 Local Map Pack.
            </p>
          </div>

          {/* Bento 4 */}
          <div className="bg-white p-6 sm:p-7 rounded-[26px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-0.5 transition-all space-y-3">
            <div className="w-10 h-10 bg-[#dcfce7] border-2 border-black rounded-xl flex items-center justify-center text-[#15803D] shadow-[2px_2px_0px_#000000]">
              <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Live Conversion Analytics</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Track camera scan counts, review formulation rates, and Google handoffs in real-time from your owner dashboard.
            </p>
          </div>

          {/* Bento 5 */}
          <div className="bg-white p-6 sm:p-7 rounded-[26px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-0.5 transition-all space-y-3">
            <div className="w-10 h-10 bg-rose-50 border-2 border-black rounded-xl flex items-center justify-center text-rose-600 shadow-[2px_2px_0px_#000000]">
              <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-black">Private Feedback Inbox</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Capture customer grievances and operational issues privately before they turn into public complaints.
            </p>
          </div>

          {/* Bento 6 */}
          <div className="bg-white p-6 sm:p-7 rounded-[26px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-0.5 transition-all space-y-3">
            <div className="w-10 h-10 bg-slate-100 border-2 border-black rounded-xl flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
              <ShieldCheck className="w-4 sm:w-5 h-4 sm:h-5 text-[#15803D]" />
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
        PRICING SECTION (Neo-Brutalist Card)
        ========================================================================
      */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-8 max-w-xl mx-auto text-center space-y-6 sm:space-y-8">
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

        <div className="bg-white border-[2.5px] border-black rounded-[32px] p-6 sm:p-8 space-y-6 sm:space-y-7 text-left shadow-[6px_6px_0px_#000000]">
          <div className="flex items-baseline justify-between border-b-2 border-black/10 pb-4 sm:pb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-black">Full Business License</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Everything needed to grow reviews</p>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-black">₹1,999</span>
              <span className="block text-[9.5px] sm:text-[10px] text-slate-500 font-semibold">One-time payment</span>
            </div>
          </div>

          <ul className="space-y-2.5 sm:space-y-3 text-xs text-slate-800">
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
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5 sm:mt-0" />
                <span className="font-bold text-black">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="w-full py-3.5 sm:py-4 bg-[#15803D] hover:bg-[#166534] text-white rounded-full font-black text-xs flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all text-center"
          >
            Claim Lifetime Access Now <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </Link>
          <p className="text-center text-[10.5px] text-slate-500 font-semibold">Instant setup in under 2 minutes</p>
        </div>
      </section>

      {/* 
        ========================================================================
        FAQ ACCORDION
        ========================================================================
      */}
      <section id="faq" className="py-16 sm:py-20 px-4 sm:px-8 max-w-3xl mx-auto space-y-8 sm:space-y-12 border-t-2 border-black/10">
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
        <div className="bg-white border-[3px] border-black rounded-[36px] p-8 sm:p-14 space-y-5 sm:space-y-6 shadow-[8px_8px_0px_#000000] relative overflow-hidden">
          
          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-black tracking-tight leading-[1.15] relative z-10">
            Start Collecting 5-Star Reviews Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed relative z-10">
            Join hundreds of local businesses that transformed their Google Maps ranking with our 30-second review assistant.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-[#15803D] hover:bg-[#166534] text-white font-black rounded-full text-xs border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all text-center"
            >
              Get Started for ₹1,999 (Lifetime) →
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 sm:py-4 bg-white hover:bg-slate-50 text-black border-2 border-black font-bold rounded-full text-xs shadow-[4px_4px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all text-center"
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
      <footer className="w-full max-w-[1080px] mx-auto px-4 sm:px-8 py-6 sm:py-8 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-4 z-10 text-center sm:text-left">
        <p>© 2026 Welurik Review. Built for local businesses to collect authentic 5-star Google reviews.</p>
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 font-bold text-black">
          <Link href="/login" className="hover:text-slate-600 transition-colors">Sign In</Link>
          <Link href="/dashboard" className="hover:text-slate-600 transition-colors">Dashboard</Link>
          <Link href="/r/the-coffee-house" target="_blank" className="hover:text-slate-600 transition-colors">Live Funnel</Link>
        </div>
      </footer>
    </div>
  );
}
