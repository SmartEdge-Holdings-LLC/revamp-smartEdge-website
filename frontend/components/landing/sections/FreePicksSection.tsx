"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { INTRO_COPY } from "@/components/landing/free-picks-content";
import { FreePickDetailCard } from "@/components/landing/sections/FreePickDetailCard";
import { PackageOffersRow } from "@/components/landing/sections/PackageOffersRow";
import { FreePicksVideosSection } from "@/components/landing/sections/FreePicksVideosSection";
import {
  listPublicFreePicks,
  type PublicPick,
} from "@/lib/api/picksApi";
import { enrichPublicPicks } from "@/lib/enrich-public-pick";
import { cn } from "@/lib/utils";

function IntroCopy() {
  const copy = INTRO_COPY.smartedge;

  return (
    <div className="max-w-4xl space-y-3 sm:space-y-4 md:space-y-5 text-sm sm:text-[15px] leading-relaxed text-zinc-300">
      {copy.paragraphs.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
      {copy.sections.map((section) => (
        <div key={section.heading}>
          <h3 className="text-sm sm:text-base font-bold text-white">{section.heading}</h3>
          {section.body && <p className="mt-1 sm:mt-2">{section.body}</p>}
        </div>
      ))}
    </div>
  );
}

export function FreePicksSection({ standalone = false }: { standalone?: boolean }) {
  const [picks, setPicks] = React.useState<PublicPick[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listPublicFreePicks({
      page: 1,
      limit: 20,
    })
      .then((res) => {
        if (!cancelled) {
          const enriched = enrichPublicPicks(res.picks);
          const sorted = enriched.sort((a, b) => {
            const aIsSmartEdge = a.createdBy?.role !== "handicapper" ? 0 : 1;
            const bIsSmartEdge = b.createdBy?.role !== "handicapper" ? 0 : 1;
            return aIsSmartEdge - bIsSmartEdge;
          });
          setPicks(sorted);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPicks([]);
          setError(err instanceof Error ? err.message : "Could not load free picks");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="free-picks"
      className={
        standalone
          ? "relative z-10 flex flex-1 flex-col"
          : "relative z-10 border-t border-white/10 px-4 sm:px-5 md:px-6 py-12 sm:py-16 md:py-20"
      }
    >
      <div
        className={
          standalone
            ? "mx-auto w-full max-w-6xl px-3 sm:px-5 md:px-6 pb-12 sm:pb-24 md:pb-32 pt-3 sm:pt-6 md:pt-8"
            : "mx-auto max-w-5xl"
        }
      >
        {standalone ? (
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-[13px] text-zinc-300">
              Free picks · SmartEdge® & handicappers
            </div>
            <h1 className="typo-hero-title mt-3 sm:mt-6 text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white">Free Picks</h1>
            <p className="mx-auto mt-2 sm:mt-4 max-w-xl text-xs sm:text-base md:text-lg leading-relaxed text-subtle">
              Sample our analysis with free active plays — full matchup, odds, and situational breakdown.
            </p>
          </div>
        ) : (
          <h1 className="font-pricing-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-accent">
            FREE PICKS
          </h1>
        )}

        <div className={standalone ? "mx-auto mt-4 sm:mt-8 md:mt-10 max-w-4xl" : "mt-3 sm:mt-6"}>
          <IntroCopy />
        </div>

        <div
          className={cn("mt-6 sm:mt-10 md:mt-12 space-y-4 sm:space-y-6 md:space-y-8", standalone && "mx-auto max-w-4xl")}
          role="tabpanel"
        >
          <div>
            <h2 className="text-center text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase tracking-wide text-white">
              Today&apos;s free picks
            </h2>
            <p className="mt-1 sm:mt-2 text-center text-xs text-zinc-500">
              Active plays with full matchup, odds, and analysis
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {loading ? (
              <div className="flex justify-center py-8 sm:py-20">
                <Loader2 className="size-5 sm:size-8 animate-spin text-accent" aria-label="Loading picks" />
              </div>
            ) : error ? (
              <p className="text-center text-xs sm:text-sm text-red-400/90 px-3 sm:px-4">{error}</p>
            ) : picks.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-white/3 px-3 sm:px-6 py-6 sm:py-12 text-center text-xs sm:text-sm text-zinc-400">
                No active free picks yet. Check back soon or browse paid plans.
              </p>
            ) : (
              picks.map((pick, index) => (
                <FreePickDetailCard
                  key={pick._id}
                  pick={pick}
                  source={pick.createdBy?.role === "handicapper" ? "handicapper" : "smartedge"}
                  featured={index === 0}
                />
              ))
            )}
          </div>
        </div>
        <FreePicksVideosSection
          showSocial
          className={cn(standalone && "mx-auto max-w-4xl")}
        />

        <PackageOffersRow />
      </div>
    </section>
  );
}
