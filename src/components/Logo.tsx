import React from "react";

interface LogoProps {
  inverted?: boolean;
  style?: React.CSSProperties;
  className?: string;
  /** Explicit pixel height if fixed across all screens */
  height?: number;
  width?: number;
}

export default function Logo({
  inverted = false,
  style = {},
  className = "",
  height,
  width,
}: LogoProps) {
  const src = inverted ? "/wr-logo-white.png" : "/wr-logo-black.png";

  const effectiveStyle: React.CSSProperties = {
    display: "block",
    objectFit: "contain",
    ...(height ? { height: `${height}px` } : {}),
    ...(width ? { width: `${width}px` } : {}),
    ...style,
  };

  // Default responsive sizing: h-10 (40px) on mobile -> h-16 (64px) on desktop
  const defaultSizeClasses = !height && !width ? "h-11 sm:h-[68px] w-auto" : "";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Welurik Review"
      className={`transition-transform duration-200 hover:scale-[1.06] select-none ${defaultSizeClasses} ${className}`}
      style={effectiveStyle}
    />
  );
}
