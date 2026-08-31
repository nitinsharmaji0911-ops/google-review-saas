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
  // Option 1: Welurik Review Logo
  const src = inverted ? "/welurik-review-dark.png" : "/welurik-review-light.png";

  const effectiveStyle: React.CSSProperties = {
    display: "block",
    objectFit: "contain",
    ...(height ? { height: `${height}px` } : {}),
    ...(width ? { width: `${width}px` } : {}),
    ...style,
  };

  const defaultSizeClasses = !height && !width ? "h-9 sm:h-[48px] w-auto" : "";

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
