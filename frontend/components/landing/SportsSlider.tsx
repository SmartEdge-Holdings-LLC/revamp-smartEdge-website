"use client";

import { useEffect, useState } from "react";
import { BrandImage } from "@/components/ui/brand-image";
import { SPORTS_LEAGUE_MARKS } from "@/lib/sports-leagues";
import { cn } from "@/lib/utils";

const MARQUEE_ROW = [...SPORTS_LEAGUE_MARKS, ...SPORTS_LEAGUE_MARKS];

export function SportsSlider({ className }: { className?: string }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const tiles = reduceMotion ? SPORTS_LEAGUE_MARKS : MARQUEE_ROW;

  return (
    <div className={cn("w-full overflow-x-hidden", className)}>
      <p className="typo-caption mb-9 text-center uppercase tracking-[0.14em] text-subtle md:mb-10">
        Covers every league you bet on{" "}
        <span className="text-subtle">· {SPORTS_LEAGUE_MARKS.length} leagues & sports</span>
      </p>
      <div
        className="relative overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        aria-label="Featured sports markets"
      >
        <div
          className={
            reduceMotion
              ? "mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-8 px-2 md:gap-x-12"
              : "sports-marquee-track items-center gap-10 pr-10 md:gap-12 md:pr-12"
          }
        >
          {tiles.map(({ name, image }, i) => (
            <div
              key={`${image}-${i}`}
              className="flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32 md:h-36 md:w-36"
            >
              <BrandImage
                src={image}
                alt={name}
                width={144}
                height={144}
                className="h-full w-full"
                fallback={<span className="typo-caption text-subtle">{name}</span>}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
