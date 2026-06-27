"use client";

import * as React from "react";
import Link from "next/link";
import { listPaidPicks } from "@/lib/api/memberPicksApi";
import { enrichPaidPicks } from "@/lib/enrich-member-pick";
import type { PaidPickFeed } from "@/lib/subscription-access";
import type { League } from "@/types/picks";
import { DashboardPickDetailCard } from "@/components/dashboard/DashboardPickDetailCard";
import { DashboardPicksGridSkeleton } from "@/components/dashboard/DashboardPickDetailCardSkeleton";
import { Button } from "@/components/ui/button";

const FEED_META: Record<
  PaidPickFeed,
  { title: string; subtitle: string; empty: string }
> = {
  admin: {
    title: "SmartEdge® VIP picks",
    subtitle: "Paid plays from the SmartEdge admin desk",
    empty: "No active SmartEdge VIP picks right now. Check back soon.",
  },
  jonah: {
    title: "Jonah VIP picks",
    subtitle: "Paid plays from Jonah handicapper",
    empty: "No active Jonah VIP picks right now. Check back soon.",
  },
};

type DashboardPaidPicksFeedProps = {
  feed: PaidPickFeed;
  token: string;
  hideHeader?: boolean;
  showFullAnalysis?: boolean;
  leagues?: League[];
  accessFilter?: string[];
};

export function DashboardPaidPicksFeed({ feed, token, hideHeader, showFullAnalysis = true, leagues = [], accessFilter }: DashboardPaidPicksFeedProps) {
  const meta = FEED_META[feed];
  const [picks, setPicks] = React.useState<ReturnType<typeof enrichPaidPicks>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Use provided accessFilter or determine based on feed type
    const accessTypes = accessFilter ?? (feed === "admin" ? ["smartedgeVIPPremium"] : undefined);

    void listPaidPicks(token, feed, {
      page: 1,
      limit: 20,
      league: leagues.length > 0 ? leagues : undefined,
      access: accessTypes
    })
      .then((res) => {
        if (cancelled) return;
        setPicks(enrichPaidPicks(res.picks, { stripAnalysis: !showFullAnalysis }));
      })
      .catch((err) => {
        if (cancelled) return;
        setPicks([]);
        setError((err as Error).message || "Could not load picks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [feed, token, leagues, showFullAnalysis, accessFilter]);

  return (
    <section className="space-y-4">
      {!hideHeader ? (
        <div>
          <h2 className="text-lg font-semibold text-white">{meta.title}</h2>
          <p className="mt-1 text-sm text-subtle">{meta.subtitle}</p>
        </div>
      ) : null}

      {loading ? (
        <DashboardPicksGridSkeleton count={4} />
      ) : error ? (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-8 text-center text-sm text-red-200">
          {error}
        </div>
      ) : picks.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-subtle">
          {meta.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          {picks.map((pick) => (
            <div key={pick._id} className="flex h-full w-full min-w-0">
              <DashboardPickDetailCard pick={pick} feed={feed} showFullAnalysis={showFullAnalysis} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type DashboardPaidPicksProps = {
  token: string;
  feeds: PaidPickFeed[];
};

export function DashboardPaidPicks({ token, feeds }: DashboardPaidPicksProps) {
  if (feeds.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <h2 className="text-lg font-semibold text-white">No active VIP subscription</h2>
        <p className="mt-2 text-sm text-subtle">
          Subscribe to SmartEdge® or Jonah to unlock paid picks on your dashboard.
        </p>
        <Link href="/#pricing" className="mt-4 inline-block">
          <Button className="bg-white text-black hover:bg-white/80">View plans</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {feeds.map((feed) => (
        <DashboardPaidPicksFeed key={feed} feed={feed} token={token} />
      ))}
    </div>
  );
}
