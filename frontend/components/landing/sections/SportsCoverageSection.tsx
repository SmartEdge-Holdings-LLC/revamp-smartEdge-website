"use client";

import { Globe2 } from "lucide-react";
import { SPORTS_COVERAGE } from "@/components/landing/landing-content";
import { BrandImage } from "@/components/ui/brand-image";
import { cn } from "@/lib/utils";

export function SportsCoverageSection() {
  return (
    <section
      id="sports-coverage"
      className="relative z-10 border-t border-white/10 bg-black px-5 py-20 sm:px-6 md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-xl space-y-5 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300">
            <Globe2 className="size-3.5 text-accent" strokeWidth={1.75} aria-hidden />
            Sports coverage
          </p>
          <div>
            <h2 className="font-pricing-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.1] tracking-tight text-white">
              Every Sport. Every Game.
            </h2>
            <p className="font-pricing-serif mt-1 text-[clamp(2.25rem,5vw,3.25rem)] italic leading-[1.1] tracking-tight pricing-accent-text">
              One platform. All the leagues.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {SPORTS_COVERAGE.map((sport) => (
            <article
              key={sport.name}
              className={cn(
                "group flex flex-col items-center rounded-3xl border border-white/10 bg-white/3 p-6 text-center transition-colors sm:p-7",
                "hover:border-accent/35 hover:bg-white/5"
              )}
            >
              <div className="flex size-24 items-center justify-center sm:size-28 md:size-32">
                <BrandImage
                  src={sport.image}
                  alt={sport.name}
                  width={128}
                  height={128}
                  className="size-20 object-contain transition-transform duration-300 group-hover:scale-105 sm:size-24 md:size-28"
                  fallback={
                    <span className="text-lg font-bold text-accent/80">{sport.name}</span>
                  }
                />
              </div>
              <h3 className="mt-5 text-base font-semibold text-white sm:text-lg">{sport.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-snug text-subtle">{sport.tagline}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
