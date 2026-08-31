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
  // Original WR Monogram Logo (Custom razor-tail ligature)
  const src = inverted ? "/wr-logo-white.png" : "/wr-logo-black.png";

  const effectiveStyle: React.CSSProperties = {
    display: "block",
    objectFit: "contain",
    ...(height ? { height: `${height}px` } : {}),
    ...(width ? { width: `${width}px` } : {}),
    ...style,
  };

  // Default responsive sizing: clean, prominent and sharp
  const defaultSizeClasses = !height && !width ? "h-10 sm:h-[58px] w-auto" : "";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Welurik Review"
      className={`transition-transform duration-200 hover:scale-[1.04] select-none ${defaultSizeClasses} ${className}`}
      style={effectiveStyle}
    />
  );
}
