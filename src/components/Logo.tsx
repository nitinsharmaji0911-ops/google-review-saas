import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function WelurikLogo({
  className = "",
  size = "md",
  showText = true,
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 30, text: "text-[14px]", badge: "text-[9.5px]", dot: 3 },
    md: { icon: 36, text: "text-[16px]", badge: "text-[10.5px]", dot: 4 },
    lg: { icon: 44, text: "text-[20px]", badge: "text-[12px]", dot: 5 },
    xl: { icon: 56, text: "text-[26px]", badge: "text-[14px]", dot: 6 },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* 
        ========================================================================
        MINIMALIST LUXURY SAAS ICON (Obsidian Squircle + Precision Razor W + Gold Star Dot)
        Inspired by Linear, Vercel & Apple Design System
        ========================================================================
      */}
      <div className="relative shrink-0 transition-transform duration-200 hover:scale-[1.03]">
        <svg
          width={current.icon}
          height={current.icon}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xs"
        >
          {/* Obsidian Matte Tile */}
          <rect
            width="40"
            height="40"
            rx="11"
            fill="#050608"
          />

          {/* Micro Hairline Glass Border */}
          <rect
            x="0.5"
            y="0.5"
            width="39"
            height="39"
            rx="10.5"
            stroke="rgba(255, 255, 255, 0.12)"
          />

          {/* Razor-sharp Minimalist 'W' Geometry */}
          <path
            d="M9 13.5L15 27.5L20 18L25 27.5L31 13.5"
            stroke="white"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Precision 5-Star Micro Apex in Subtle Champagne Gold */}
          <path
            d="M20 9L20.8 11.2H23L21.2 12.5L21.9 14.7L20 13.3L18.1 14.7L18.8 12.5L17 11.2H19.2L20 9Z"
            fill="#FBBF24"
          />
        </svg>
      </div>

      {/* 
        ========================================================================
        MINIMALIST SWISS TYPOGRAPHY LOCKUP
        ========================================================================
      */}
      {showText && (
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-[-0.03em] text-slate-950 ${current.text}`}>
            Welurik
          </span>
          <span className="text-slate-300 font-light select-none">/</span>
          <span className={`font-semibold tracking-[-0.02em] text-slate-500 ${current.text}`}>
            Review
          </span>
        </div>
      )}
    </div>
  );
}
