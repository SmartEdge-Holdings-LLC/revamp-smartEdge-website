"use client";

import { FEATURED_HANDICAPPERS } from "@/components/landing/landing-content";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";
import { cn } from "@/lib/utils";

export function HandicappersSection() {
  return (
    <section
      id="meet-experts"
      className="relative z-10 border-t border-white/10 bg-black px-5 py-20 sm:px-6 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300">
            Featured handicappers
          </p>
          <h2 className="font-pricing-serif mt-5 text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.12] tracking-tight text-white">
            Meet the Experts
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-subtle md:text-xl">
            Real professionals. Real track records. Picks you can trust.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {FEATURED_HANDICAPPERS.map((expert) => (
            <article
              key={expert.name}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/3 p-6 transition-colors hover:border-white/15 hover:bg-white/5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ring-white/10",
                    expert.avatarClass
                  )}
                >
                  {expert.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white">{expert.name}</h3>
                  <p className="mt-0.5 text-sm text-accent">{expert.sport}</p>
                  <p className="mt-1 text-xs text-zinc-500">{expert.years}</p>
                </div>
              </div>

              <span className="mt-4 inline-flex w-fit rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                {expert.winRate}
              </span>

              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-subtle">{expert.bio}</p>

              <div className="mt-6">
                <PricingAccentButton href="/#pricing" fullWidth className="typo-button-md">
                  View Picks
                </PricingAccentButton>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
