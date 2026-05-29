"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  INTRO_COPY,
  SOURCE_TABS,
} from "@/components/landing/free-picks-content";
import { FreePickDetailCard } from "@/components/landing/sections/FreePickDetailCard";
import { PackageOffersRow } from "@/components/landing/sections/PackageOffersRow";
import { FreePicksVideosSection } from "@/components/landing/sections/FreePicksVideosSection";
import { SportLeagueHighlights } from "@/components/landing/sections/SportLeagueHighlights";
import {
  listPublicFreePicks,
  type PublicPick,
  type PublicPickSource,
} from "@/lib/api/picksApi";
import { enrichPublicPicks } from "@/lib/enrich-public-pick";
import { cn } from "@/lib/utils";

function IntroCopy({ source }: { source: PublicPickSource }) {
  const copy = INTRO_COPY[source];

  return (
    <div className="max-w-4xl space-y-5 text-[15px] leading-relaxed text-zinc-300">
      {copy.paragraphs.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
      {copy.sections.map((section) => (
        <div key={section.heading}>
          <h3 className="text-base font-bold text-white">{section.heading}</h3>
          <p className="mt-2">{section.body}</p>
        </div>
      ))}
      <SportLeagueHighlights highlights={copy.sportHighlights} />
    </div>
  );
}

export function FreePicksSection({ standalone = false }: { standalone?: boolean }) {
  const [source, setSource] = React.useState<PublicPickSource>("smartedge");
  const [picks, setPicks] = React.useState<PublicPick[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listPublicFreePicks({ page: 1, limit: 12, source })
      .then((res) => {
        if (!cancelled) {
          setPicks(enrichPublicPicks(res.picks));
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
  }, [source]);

  return (
    <section
      id="free-picks"
      className={
        standalone
          ? "relative z-10 flex flex-1 flex-col"
          : "relative z-10 border-t border-white/10 px-4 py-16 sm:px-6 md:py-20"
      }
    >
      <div
        className={
          standalone
            ? "mx-auto w-full max-w-6xl px-5 pb-24 pt-6 sm:px-6 md:pb-32 md:pt-8"
            : "mx-auto max-w-5xl"
        }
      >
        {standalone ? (
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300">
              Free picks · SmartEdge® & handicappers
            </div>
            <h1 className="typo-hero-title mt-6 text-white">Free Picks</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-subtle md:text-xl">
              Sample our analysis with free active plays — full matchup, odds, and situational
              breakdown on every card.
            </p>
          </div>
        ) : (
          <h1 className="font-pricing-serif text-3xl font-bold tracking-tight text-accent sm:text-4xl">
            FREE PICKS
          </h1>
        )}

        <div className={standalone ? "mx-auto mt-10 max-w-4xl" : "mt-6"}>
          <IntroCopy source={source} />
        </div>

        <FreePicksVideosSection
          showSocial
          className={cn(standalone && "mx-auto max-w-4xl")}
        />

        {/* Source toggle — below watch & follow */}
        <div className={cn("mt-10", standalone && "flex justify-center")}>
          <div
            className="relative inline-flex w-full max-w-none flex-nowrap overflow-x-auto rounded-full border border-white/10 bg-white/3 p-1 sm:w-auto"
            role="tablist"
            aria-label="Free pick source"
          >
            {SOURCE_TABS.map((tab) => {
              const isActive = source === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSource(tab.value)}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap rounded-full px-4 py-3 text-center text-[13px] font-medium leading-none transition-colors sm:px-6 sm:text-sm",
                    isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {isActive ? (
                    <span
                      className="absolute inset-0 rounded-full border border-accent/55 bg-white/4 shadow-[0_0_20px_rgb(234_105_58/0.12)]"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={cn("mt-10 space-y-8", standalone && "mx-auto max-w-4xl")}
          role="tabpanel"
        >
          <h2 className="text-center text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
            Today&apos;s free picks
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-500">
            Active plays with full matchup, odds, and analysis
          </p>

          <div className="mt-8 space-y-8">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-accent" aria-label="Loading picks" />
              </div>
            ) : error ? (
              <p className="text-center text-sm text-red-400/90">{error}</p>
            ) : picks.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-white/3 px-6 py-12 text-center text-sm text-zinc-400">
                No active free picks for this source yet. Check back soon or browse paid plans below.
              </p>
            ) : (
              picks.map((pick, index) => (
                <FreePickDetailCard
                  key={pick._id}
                  pick={pick}
                  source={source}
                  featured={index === 0}
                />
              ))
            )}
          </div>
        </div>

        <PackageOffersRow pickSource={source} />
      </div>
    </section>
  );
}
