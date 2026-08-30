import React from "react";

interface LogoProps {
  inverted?: boolean;
  style?: React.CSSProperties;
  className?: string;
  /** numeric width fallback */
  width?: number;
}

export default function Logo({ inverted = false, style = {}, className, width }: LogoProps) {
  const src = inverted ? "/logo-white.svg" : "/logo-black.svg";

  const effectiveStyle = className
    ? style
    : { width: width ? `${width}px` : "170px", height: "auto", ...style };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="WELURIK REVIEW"
      className={className}
      style={{
        display: "block",
        objectFit: "contain",
        ...effectiveStyle,
      }}
    />
  );
}
