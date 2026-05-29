"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Lock, Loader2 } from "lucide-react";
import {
  SOURCE_TABS,
  type PublicPickSource,
} from "@/components/landing/free-picks-content";
import { FreePickDetailCard } from "@/components/landing/sections/FreePickDetailCard";
import { PackageOffersRow } from "@/components/landing/sections/PackageOffersRow";
import { DashboardPickDetailCard } from "@/components/dashboard/DashboardPickDetailCard";
import { listPaidPicks, type PaidPick } from "@/lib/api/memberPicksApi";
import { enrichPaidPicks } from "@/lib/enrich-member-pick";
import type { PublicPick } from "@/lib/api/picksApi";
import {
  hasJonahPaidAccess,
  hasSmartedgePaidAccess,
  type PaidPickFeed,
} from "@/lib/subscription-access";
import type { SessionMemberUser } from "@/types/member-session";
import { cn } from "@/lib/utils";

function sourceToFeed(source: PublicPickSource): PaidPickFeed {
  return source === "smartedge" ? "admin" : "jonah";
}

const LOCKED_PREVIEW_PICKS: Record<PublicPickSource, PublicPick[]> = {
  smartedge: [
    {
      _id: "locked-smartedge-preview-1",
      league: "NBA",
      game: "Celtics @ Knicks",
      awayTeamId: "boston-celtics",
      homeTeamId: "new-york-knicks",
      awayTeamName: "Celtics",
      homeTeamName: "Knicks",
      awayTeamLogo: "/leagues/nba/Boston%20Celtics.png",
      homeTeamLogo: "/leagues/nba/New%20York%20Knicks.png",
      pickTitle: "Premium pick locked",
      detailedAnalysis:
        "This premium analysis is locked. Subscribe to SmartEdge to unlock the full breakdown, odds, and confidence context.",
      odds: "Locked",
      betType: "spread",
      confidence: 0,
      access: "free",
      status: "active",
      createdBy: { name: "SmartEdge Desk", role: "admin" },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  handicapper: [
    {
      _id: "locked-jonah-preview-1",
      league: "NFL",
      game: "Bills @ Chiefs",
      awayTeamId: "buffalo-bills",
      homeTeamId: "kansas-city-chief",
      awayTeamName: "Bills",
      homeTeamName: "Chiefs",
      awayTeamLogo: "/leagues/nfl/Buffalo%20Bills.png",
      homeTeamLogo: "/leagues/nfl/Kansas%20City%20Chief.png",
      pickTitle: "Premium pick locked",
      detailedAnalysis:
        "This Jonah premium card is locked. Purchase a Jonah package to unlock full pick details, odds, and analysis.",
      odds: "Locked",
      betType: "spread",
      confidence: 0,
      access: "free",
      status: "active",
      createdBy: { name: "Jonah", role: "handicapper" },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

function LockedPremiumCard({ source, pick }: { source: PublicPickSource; pick: PublicPick }) {
  const brand = source === "smartedge" ? "SmartEdge" : "Jonah";
  const pricingHref =
    source === "handicapper" ? "/?pricingTab=handicappers#pricing" : "/?pricingTab=vip#pricing";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="pointer-events-none select-none">
        <FreePickDetailCard pick={pick} source={source} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/45">
        <div className="rounded-xl border border-white/15 bg-black/75 px-5 py-4 text-center backdrop-blur-sm">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <Lock className="size-4 text-accent" />
            {brand} premium pick locked
          </p>
          <p className="mt-1 text-xs text-zinc-300">
            Buy a package to unlock odds, play, and full detailed analysis.
          </p>
          <Link
            href={pricingHref}
            className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-md bg-accent px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-accent/90"
          >
            Buy now
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ExpertPicksSection() {
  const { data: session, status } = useSession();
  const [source, setSource] = React.useState<PublicPickSource>("smartedge");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [paidPicks, setPaidPicks] = React.useState<PaidPick[]>([]);

  const user = session?.user as SessionMemberUser | undefined;
  const token = user?.backendToken;
  const hasFeedAccess =
    source === "smartedge"
      ? user
        ? hasSmartedgePaidAccess(user)
        : false
      : user
        ? hasJonahPaidAccess(user)
        : false;
  const canLoadPaidPicks = Boolean(token && hasFeedAccess);
  const feed = sourceToFeed(source);
  const lockedTeasers = LOCKED_PREVIEW_PICKS[source];

  React.useEffect(() => {
    let cancelled = false;

    if (!canLoadPaidPicks || !token) {
      setPaidPicks([]);
      setLoading(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    void listPaidPicks(token, feed, { page: 1, limit: 8 })
      .then((res) => {
        if (cancelled) return;
        setPaidPicks(enrichPaidPicks(res.picks));
      })
      .catch((err) => {
        if (cancelled) return;
        setPaidPicks([]);
        setError(err instanceof Error ? err.message : "Could not load premium picks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canLoadPaidPicks, feed, token]);

  return (
    <section className="relative z-10 flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-6 sm:px-6 md:pb-32 md:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300">
            Premium picks · SmartEdge® + Jonah
          </div>
          <h1 className="typo-hero-title mt-6 text-white">Expert Picks</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-subtle md:text-xl">
            View our premium cards from SmartEdge and Jonah. Odds and deeper analysis are locked
            until you purchase a plan.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div
            className="relative inline-flex w-full max-w-none flex-nowrap overflow-x-auto rounded-full border border-white/10 bg-white/3 p-1 sm:w-auto"
            role="tablist"
            aria-label="Premium pick source"
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
                    "relative shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-3 text-center text-[13px] font-medium leading-none transition-colors sm:px-6 sm:text-sm",
                    isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {isActive ? (
                    <span
                      className="absolute inset-0 rounded-full border border-accent/55 bg-white/4 shadow-[0_0_20px_rgb(234_105_58/0.12)]"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-10">{tab.label.replace("free", "premium")}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl space-y-8">
          {status === "loading" ? (
            <div className="flex justify-center py-20">
              <Loader2 className="size-8 animate-spin text-accent" aria-label="Loading session" />
            </div>
          ) : canLoadPaidPicks ? (
            loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-accent" aria-label="Loading picks" />
              </div>
            ) : error ? (
              <p className="text-center text-sm text-red-400/90">{error}</p>
            ) : paidPicks.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-white/3 px-6 py-12 text-center text-sm text-zinc-400">
                No active premium picks in this feed right now.
              </p>
            ) : (
              paidPicks.map((pick) => <DashboardPickDetailCard key={pick._id} pick={pick} feed={feed} />)
            )
          ) : (
            <>
              <p className="text-center text-sm text-zinc-400">
                {source === "smartedge"
                  ? "SmartEdge premium picks are locked. Subscribe to view full odds and analysis."
                  : "Jonah premium picks are locked. Subscribe to view full odds and analysis."}
              </p>
              {lockedTeasers.map((teaser) => (
                <LockedPremiumCard
                  key={teaser._id}
                  source={source}
                  pick={teaser}
                />
              ))}
            </>
          )}
        </div>

        <PackageOffersRow pickSource={source} />
      </div>
    </section>
  );
}
