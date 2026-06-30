"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Lock, Loader2 } from "lucide-react";
import { FreePickDetailCard } from "@/components/landing/sections/FreePickDetailCard";
import { PricingSection } from "@/components/landing/PricingSection";
import { readAuthSession } from "@/lib/authCookies";
import { cn } from "@/lib/utils";
import type { PublicPick } from "@/lib/api/picksApi";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type TabType = "smartedge" | "jonah";

function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = date.toDateString();
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();

  if (dateStr === todayStr) return "Today's Expert Picks";
  if (dateStr === yesterdayStr) return "Yesterday's Expert Picks";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function groupPicksByDate(picks: PublicPick[]): Array<{ date: Date; label: string; picks: PublicPick[] }> {
  const grouped = new Map<string, PublicPick[]>();

  picks.forEach((pick) => {
    const pickDate = new Date(pick.createdAt);
    const dateKey = pickDate.toDateString();
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(pick);
  });

  return Array.from(grouped.entries())
    .map(([dateStr, picksForDate]) => ({
      date: new Date(dateStr),
      label: getDateLabel(new Date(dateStr)),
      picks: picksForDate,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function ExpertPicksSection() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [tab, setTab] = React.useState<TabType>("smartedge");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [expertPicks, setExpertPicks] = React.useState<PublicPick[]>([]);

  React.useEffect(() => {
    const adminSession = readAuthSession();
    setIsAdmin(adminSession?.role === "admin" || adminSession?.role === "handicapper");
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const accessType = tab === "smartedge" ? "smartedgeVIP" : "jonahvip";
    const apiUrl = isAdmin
      ? `/api/picks/admin?page=1&limit=12&access=${accessType}`
      : `${BACKEND_URL}/api/picks?page=1&limit=12&access=${accessType}`;

    void fetch(apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load picks (HTTP ${res.status})`);
        return res.json();
      })
      .then((data: { picks: PublicPick[] }) => {
        if (cancelled) return;
        const sorted = data.picks.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setExpertPicks(sorted);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setExpertPicks([]);
        setError(err instanceof Error ? err.message : "Could not load expert picks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, isAdmin]);

  const source = tab === "smartedge" ? "smartedge" : "handicapper";
  const title = tab === "smartedge" ? "SmartEdge® VIP" : "Jonah's Monthly Standard";
  const description = tab === "smartedge"
    ? "Discover SmartEdge VIP picks with professional analysis, odds, and confidence levels."
    : "Explore Jonah's Monthly Standard picks with expert selection and detailed analysis.";

  return (
    <section className="relative z-10 flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-5 md:px-6 pb-12 sm:pb-24 md:pb-32 pt-3 sm:pt-6 md:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-[13px] text-zinc-300">
            Curated picks · Expert selection
          </div>
          <h1 className="typo-hero-title mt-3 sm:mt-6 text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white">{title}</h1>
          <p className="mx-auto mt-2 sm:mt-4 max-w-2xl text-xs sm:text-base md:text-lg leading-relaxed text-subtle">
            {description}
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 sm:mt-10 md:mt-12 flex justify-center gap-1 sm:gap-2 border-b border-white/10 flex-wrap">
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
            SmartEdge® VIP
          </button>
          <button
            type="button"
            onClick={() => setTab("jonah")}
            className={cn(
              "px-2.5 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-medium transition-colors border-b-2 whitespace-nowrap",
              tab === "jonah"
                ? "border-accent text-white"
                : "border-transparent text-subtle hover:text-white"
            )}
          >
            Jonah VIP
          </button>
        </div>

        <div className="mx-auto mt-4 sm:mt-8 md:mt-10 max-w-4xl space-y-8 sm:space-y-12 md:space-y-16">
          {loading ? (
            <div className="flex justify-center py-8 sm:py-20">
              <Loader2 className="size-5 sm:size-8 animate-spin text-accent" aria-label="Loading picks" />
            </div>
          ) : error ? (
            <p className="text-center text-xs sm:text-sm text-red-400/90 px-3 sm:px-4">{error}</p>
          ) : expertPicks.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-white/3 px-3 sm:px-6 py-6 sm:py-12 text-center text-xs sm:text-sm text-zinc-400">
              No monthly VIP picks available right now.
            </p>
          ) : (
            groupPicksByDate(expertPicks).map((group, groupIndex) => (
              <div key={group.label}>
                <div className={groupIndex > 0 ? "pt-8 sm:pt-12 border-t border-white/10" : ""}>
                  <h2 className="text-left text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide text-white">
                    {group.label}
                  </h2>
                  <p className="mt-1 sm:mt-2 text-left text-xs text-zinc-500">
                    Premium picks with full matchup, odds, and analysis
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 md:mt-8 space-y-3 sm:space-y-6 md:space-y-8">
                  {group.picks.map((pick) => {
                    const isPickLocked = !isAdmin && (!session || pick.access !== "free");

                    return (
                      <div key={pick._id} className={isPickLocked ? "relative" : ""}>
                        {isPickLocked && (
                          <div className="absolute inset-0 flex items-end justify-center pb-12 bg-black/10 rounded-2xl z-10">
                            <div className="rounded-lg border border-white/15 bg-black/80 px-3 sm:px-5 py-2.5 sm:py-4 text-center backdrop-blur-sm max-w-xs mx-2">
                              <p className="inline-flex items-center gap-1.5 text-[11px] sm:text-sm font-semibold text-white">
                                <Lock className="size-3 sm:size-4 text-accent" />
                                VIP pick locked
                              </p>
                              <p className="mt-1 text-[10px] sm:text-xs text-zinc-300">
                                Purchase a plan to view analysis & odds.
                              </p>
                              <Link
                                href="/#pricing"
                                className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-md bg-accent px-2.5 sm:px-3.5 py-1 sm:py-2 text-[10px] sm:text-xs font-semibold text-white transition hover:bg-accent/90 w-full"
                              >
                                Buy Picks Now
                              </Link>
                            </div>
                          </div>
                        )}
                        <div className={isPickLocked ? "pointer-events-none select-none" : ""}>
                          <FreePickDetailCard pick={pick} source={source} isAdmin={isAdmin} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pricing Section */}
      <PricingSection defaultView={tab === "smartedge" ? "vip" : "handicappers"} />
    </section>
  );
}
