import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "bubble-star" | "qr-pin" | "ai-spark";
  showText?: boolean;
}

export default function WelurikLogo({
  className = "",
  size = "md",
  variant = "bubble-star",
  showText = true,
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 28, text: "text-base", sub: "text-[9px]" },
    md: { icon: 36, text: "text-lg", sub: "text-[10.5px]" },
    lg: { icon: 48, text: "text-2xl", sub: "text-xs" },
    xl: { icon: 64, text: "text-3xl", sub: "text-sm" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* 
        ========================================================================
        LOGO ICON MARK (THEME-ALIGNED: GOOGLE REVIEWS + 5-STAR + AI + W)
        ========================================================================
      */}
      <div className="relative group shrink-0">
        {/* Subtle Violet Ambient Glow Aura matching app theme */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600/40 via-violet-500/30 to-amber-400/20 rounded-2xl blur-sm group-hover:blur-md transition-all pointer-events-none" />

        {/* 
          OPTION 1 (DEFAULT): THE 5-STAR REVIEW BUBBLE "W" 
          Combines: Double Speech Bubble + Letter W + 5-Star Acclaim + Purple Neo-Shadow
        */}
        {variant === "bubble-star" && (
          <svg
            width={currentSize.icon}
            height={currentSize.icon}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 drop-shadow-[0_4px_12px_rgba(147,51,234,0.25)] transition-transform group-hover:scale-105"
          >
            {/* Neo-brutalist rounded container with bold border */}
            <rect
              x="2"
              y="2"
              width="44"
              height="44"
              rx="13"
              fill="#090A0F"
              stroke="#1E202E"
              strokeWidth="1.5"
            />

            {/* Subtle frosted glass ambient inner rim */}
            <rect
              x="3"
              y="3"
              width="42"
              height="42"
              rx="12"
              stroke="url(#purpleGlowRim)"
              strokeWidth="1"
            />

            {/* Left & Right Review Speech Wings forming the 'W' */}
            <path
              d="M10 15L17 33L24 21L31 33L38 15"
              stroke="url(#welurikGradient)"
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Central Glowing Golden Google 5-Star at the 'W' Heart */}
            <path
              d="M24 10.5L25.8 15.2H30.6L26.7 18.1L28.2 22.8L24 19.8L19.8 22.8L21.3 18.1L17.4 15.2H22.2L24 10.5Z"
              fill="#FBBF24"
              filter="drop-shadow(0 0 6px rgba(251, 191, 36, 0.7))"
            />

            {/* Mini review accent dot */}
            <circle cx="38" cy="15" r="2.2" fill="#A855F7" />
            <circle cx="10" cy="15" r="2.2" fill="#818CF8" />

            <defs>
              <linearGradient
                id="welurikGradient"
                x1="10"
                y1="15"
                x2="38"
                y2="33"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#A855F7" />
                <stop offset="0.5" stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#FBBF24" />
              </linearGradient>
              <linearGradient
                id="purpleGlowRim"
                x1="3"
                y1="3"
                x2="45"
                y2="45"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#A855F7" stopOpacity="0.6" />
                <stop offset="1" stopColor="#FBBF24" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* 
          OPTION 2: THE QR & GOOGLE MAPS STAR PIN "W"
          Combines: Table Standee QR Geometry + Google Maps Pin Vertex + Star Center
        */}
        {variant === "qr-pin" && (
          <svg
            width={currentSize.icon}
            height={currentSize.icon}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 drop-shadow-[0_4px_12px_rgba(251,191,36,0.25)] transition-transform group-hover:scale-105"
          >
            <rect x="2" y="2" width="44" height="44" rx="13" fill="#090A0F" stroke="#1E202E" strokeWidth="1.5" />
            {/* Outer W Pin Frame */}
            <path
              d="M12 14V28C12 33 24 38 24 38C24 38 36 33 36 28V14L24 23L12 14Z"
              fill="url(#pinGrad)"
              fillOpacity="0.15"
              stroke="url(#pinGrad)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* 5-Star Sparkle at Center */}
            <path
              d="M24 16L25.5 20.2H29.8L26.3 22.8L27.6 27L24 24.3L20.4 27L21.7 22.8L18.2 20.2H22.5L24 16Z"
              fill="#FBBF24"
              filter="drop-shadow(0 0 8px #FBBF24)"
            />
            <defs>
              <linearGradient id="pinGrad" x1="12" y1="14" x2="36" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9333EA" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* 
          OPTION 3: THE AI INTELLIGENCE & 5-STAR SPARK "W"
          Combines: Google Gemini 4-Point Star + Dynamic W Wings
        */}
        {variant === "ai-spark" && (
          <svg
            width={currentSize.icon}
            height={currentSize.icon}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 drop-shadow-[0_4px_12px_rgba(147,51,234,0.3)] transition-transform group-hover:scale-105"
          >
            <rect x="2" y="2" width="44" height="44" rx="13" fill="#090A0F" stroke="#1E202E" strokeWidth="1.5" />
            <path d="M11 16L18 34L24 22L30 34L37 16" stroke="#9333EA" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* AI Spark Cross */}
            <path d="M24 8C24 13.5 28.5 18 34 18C28.5 18 24 22.5 24 28C24 22.5 19.5 18 14 18C19.5 18 24 13.5 24 8Z" fill="#FBBF24" filter="drop-shadow(0 0 6px rgba(251,191,36,0.8))" />
          </svg>
        )}
      </div>

      {/* 
        ========================================================================
        TYPOGRAPHY LOCKUP
        ========================================================================
      */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className={`font-black ${currentSize.text} text-slate-950 tracking-tight`}>
              Welurik
            </span>
            <span className={`font-extrabold ${currentSize.text} bg-gradient-to-r from-purple-600 via-violet-600 to-amber-500 bg-clip-text text-transparent tracking-tight`}>
              Review
            </span>
          </div>
          <span className={`font-semibold ${currentSize.sub} text-slate-400 tracking-wider uppercase -mt-0.5`}>
            AI 5-Star Engine
          </span>
        </div>
      )}
    </div>
  );
}
