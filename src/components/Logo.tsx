import React from "react";

interface LogoProps {
  inverted?: boolean;
  style?: React.CSSProperties;
  className?: string;
  /** numeric width fallback */
  width?: number;
  height?: number;
}

export default function Logo({
  inverted = false,
  style = {},
  className = "",
  width = 38,
  height,
}: LogoProps) {
  const src = inverted ? "/logo-white.svg" : "/logo-black.svg";

  const effectiveStyle: React.CSSProperties = {
    width: width ? `${width}px` : "38px",
    height: height ? `${height}px` : "auto",
    display: "block",
    objectFit: "contain",
    ...style,
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Welurik Review"
      className={`transition-transform duration-200 hover:scale-[1.05] select-none ${className}`}
      style={effectiveStyle}
    />
  );
}
