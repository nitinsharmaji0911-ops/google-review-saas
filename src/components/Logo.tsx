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
  // Pure crisp logo asset with matte black W and Review
  const effectiveStyle: React.CSSProperties = {
    display: "block",
    objectFit: "contain",
    ...(height ? { height: `${height}px` } : {}),
    ...(width ? { width: `${width}px` } : {}),
    ...style,
  };

  const defaultSizeClasses = !height && !width ? "h-8 sm:h-10 w-auto" : "";

  return (
    <div className="inline-flex items-center bg-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl sm:rounded-full border border-black shadow-[2px_2px_0px_#000000] hover:scale-[1.03] transition-transform select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/welurik-review-logo.png"
        alt="Welurik Review"
        className={`${defaultSizeClasses} ${className}`}
        style={effectiveStyle}
      />
    </div>
  );
}
