"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { INTRO_COPY } from "@/components/landing/free-picks-content";
import { FreePickDetailCard } from "@/components/landing/sections/FreePickDetailCard";
import { PackageOffersRow } from "@/components/landing/sections/PackageOffersRow";
import { FreePicksVideosSection } from "@/components/landing/sections/FreePicksVideosSection";
import {
  listPublicFreePicks,
  listAuthenticatedPicks,
  type PublicPick,
} from "@/lib/api/picksApi";
import { enrichPublicPicks } from "@/lib/enrich-public-pick";
import { readAuthSession } from "@/lib/authCookies";
import { cn } from "@/lib/utils";
import { getDateStringInET, getTodayDateStringInET, getYesterdayDateStringInET } from "@/lib/datetime";

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

function getDateLabel(dateStringInET: string): string {
  const today = getTodayDateStringInET();
  const yesterday = getYesterdayDateStringInET();

  if (dateStringInET === today) return "Today's Free Picks";
  if (dateStringInET === yesterday) return "Yesterday's Free Picks";
  return dateStringInET;
}

function groupPicksByDate(picks: PublicPick[]): Array<{ dateString: string; label: string; picks: PublicPick[] }> {
  const grouped = new Map<string, PublicPick[]>();

  picks.forEach((pick) => {
    // Group by matchTime converted to ET date string
    const dateKeyInET = getDateStringInET(pick.matchTime) || getDateStringInET(pick.createdAt) || "Unknown";
    if (!grouped.has(dateKeyInET)) {
      grouped.set(dateKeyInET, []);
    }
    grouped.get(dateKeyInET)!.push(pick);
  });

  return Array.from(grouped.entries())
    .map(([dateStr, picksForDate]) => ({
      dateString: dateStr,
      label: getDateLabel(dateStr),
      picks: picksForDate,
    }))
    .sort((a, b) => {
      // Parse date strings in reverse chronological order (newest first)
      const dateA = new Date(a.dateString);
      const dateB = new Date(b.dateString);
      return dateB.getTime() - dateA.getTime();
    });
}

type FreePickTab = "smartedge" | "handicapper";

export function FreePicksSection({ standalone = false }: { standalone?: boolean }) {
  const [picks, setPicks] = React.useState<PublicPick[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [tab, setTab] = React.useState<FreePickTab>("smartedge");

  React.useEffect(() => {
    const session = readAuthSession();
    setIsAdmin(session?.role === "admin" || session?.role === "handicapper");
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchPicks = isAdmin ? listAuthenticatedPicks : listPublicFreePicks;

    fetchPicks({
      page: 1,
      limit: 20,
    })
      .then((res) => {
        if (!cancelled) {
          const enriched = enrichPublicPicks(res.picks);
          const sorted = enriched.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
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
  }, [isAdmin]);

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

        {/* Tabs */}
        <div className={cn("mt-6 sm:mt-10 md:mt-12 flex justify-center gap-1 sm:gap-2 border-b border-white/10 flex-wrap", standalone && "mx-auto max-w-4xl")}>
          <button
            type="button"
            onClick={() => setTab("smartedge")}
            className={cn(
              "px-2.5 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium transition-colors border-b-2 whitespace-nowrap",
              tab === "smartedge"
                ? "border-accent text-white"
                : "border-transparent text-subtle hover:text-white"
            )}
          >
            SmartEdge® Free Picks
          </button>
          <button
            type="button"
            onClick={() => setTab("handicapper")}
            className={cn(
              "px-2.5 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium transition-colors border-b-2 whitespace-nowrap",
              tab === "handicapper"
                ? "border-accent text-white"
                : "border-transparent text-subtle hover:text-white"
            )}
          >
            Jonah's Free Picks
          </button>
        </div>

        <div
          className={cn("mt-6 sm:mt-10 md:mt-12 space-y-8 sm:space-y-12 md:space-y-16", standalone && "mx-auto max-w-4xl")}
          role="tabpanel"
        >
          {loading ? (
            <div className="flex justify-center py-8 sm:py-20">
              <Loader2 className="size-5 sm:size-8 animate-spin text-accent" aria-label="Loading picks" />
            </div>
          ) : error ? (
            <p className="text-center text-xs sm:text-sm text-red-400/90 px-3 sm:px-4">{error}</p>
          ) : (
            (() => {
              const filteredPicks = picks.filter((pick) => {
                const pickRole = pick.createdBy?.role;
                return tab === "smartedge"
                  ? pickRole === "admin" || pickRole === "subadmin"
                  : pickRole === "handicapper";
              });
              return filteredPicks.length === 0 ? (
                <p className="rounded-lg border border-white/10 bg-white/3 px-3 sm:px-6 py-6 sm:py-12 text-center text-xs sm:text-sm text-zinc-400">
                  No active {tab === "smartedge" ? "SmartEdge" : "Jonah"} free picks yet. Check back soon or browse paid plans.
                </p>
              ) : (
                groupPicksByDate(filteredPicks).map((group, groupIndex) => (
              <div key={group.label}>
                <div className={groupIndex > 0 ? "pt-8 sm:pt-12 border-t border-white/10" : ""}>
                  <h2 className="text-left text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide text-white">
                    {group.label}
                  </h2>
                  <p className="mt-1 sm:mt-2 text-left text-xs text-zinc-500">
                    Active plays with full matchup, odds, and analysis
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 md:mt-8 space-y-4 sm:space-y-6 md:space-y-8">
                  {group.picks.map((pick, index) => (
                    <FreePickDetailCard
                      key={pick._id}
                      pick={pick}
                      source={pick.createdBy?.role === "handicapper" ? "handicapper" : "smartedge"}
                      featured={groupIndex === 0 && index === 0}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </div>
            ))
              );
            })()
          )}
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
