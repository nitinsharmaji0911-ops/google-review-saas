import React from "react";

interface LogoProps {
  inverted?: boolean;
  style?: React.CSSProperties;
  className?: string;
  /** Height of the mark in pixels (default 44px) */
  height?: number;
  width?: number;
}

export default function Logo({
  inverted = false,
  style = {},
  className = "",
  height = 42,
  width,
}: LogoProps) {
  const src = inverted ? "/wr-logo-white.png" : "/wr-logo-black.png";

  const effectiveStyle: React.CSSProperties = {
    height: height ? `${height}px` : "42px",
    width: width ? `${width}px` : "auto",
    display: "block",
    objectFit: "contain",
    ...style,
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Welurik Review"
      className={`transition-transform duration-200 hover:scale-[1.06] select-none ${className}`}
      style={effectiveStyle}
    />
  );
}
