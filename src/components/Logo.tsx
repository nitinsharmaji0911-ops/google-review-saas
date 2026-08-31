import React from "react";

interface LogoProps {
  inverted?: boolean;
  style?: React.CSSProperties;
  className?: string;
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
  // Pure transparent logo with green square + matte black W + black elurik + green Review
  const src = inverted ? "/welurik-review-dark.png" : "/welurik-review-light.png";

  const effectiveStyle: React.CSSProperties = {
    display: "block",
    objectFit: "contain",
    ...(height ? { height: `${height}px` } : {}),
    ...(width ? { width: `${width}px` } : {}),
    ...style,
  };

  const defaultSizeClasses = !height && !width ? "h-8 sm:h-11 w-auto" : "";

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
