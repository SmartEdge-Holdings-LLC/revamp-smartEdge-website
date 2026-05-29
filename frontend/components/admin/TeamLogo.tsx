"use client";

import { BrandImage } from "@/components/ui/brand-image";
import { cn } from "@/lib/utils";

export function TeamLogo({
  src,
  shortName,
  size = 22,
  className,
}: {
  src?: string;
  shortName?: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-transparent",
        className
      )}
      style={{ width: size, height: size }}
    >
      <BrandImage
        src={src ?? ""}
        alt={shortName ?? "Team"}
        width={size}
        height={size}
        className="h-full w-full"
        fallback={
          <span className="text-[8px] font-bold leading-none text-accent">
            {(shortName ?? "T").slice(0, 3)}
          </span>
        }
      />
    </span>
  );
}
