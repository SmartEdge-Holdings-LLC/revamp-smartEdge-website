"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type BrandImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallback?: React.ReactNode;
  draggable?: boolean;
};

/**
 * Local brand logos (PNG/SVG/WebP from `/public`). Uses a native `img` so mixed
 * formats work without Next.js Image optimizer quirks or hydration mismatches.
 */
export function BrandImage({
  src,
  alt,
  width,
  height,
  className,
  fallback,
  draggable,
}: BrandImageProps) {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return fallback ?? null;
  }

  const safeSrc = src.includes(" ") ? encodeURI(src) : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safeSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-contain", className)}
      decoding="async"
      draggable={draggable}
      onError={() => setFailed(true)}
    />
  );
}
