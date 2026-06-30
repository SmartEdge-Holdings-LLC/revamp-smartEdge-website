"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, CheckCircle2, XCircle, Clock } from "lucide-react";
import { BrandImage } from "@/components/ui/brand-image";
import { leagueDisplayName, TRACK_RECORD_LINE } from "@/components/landing/free-picks-content";
import { getPickLeagueLogo, getSportsLeagueLogo } from "@/lib/sports-leagues";
import type { PaidPick } from "@/lib/api/memberPicksApi";
import type { PaidPickFeed } from "@/lib/subscription-access";
import { BET_TYPE_LABELS, type BetType } from "@/types/picks";
import { teamLogoPath } from "@/types/picks";
import { formatDateET, formatDateTimeLongET } from "@/lib/datetime";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function betTypeLabel(betType: string) {
  return betType in BET_TYPE_LABELS ? BET_TYPE_LABELS[betType as BetType] : betType;
}

function teamLogo(
  stored: string | undefined,
  league: PaidPick["league"],
  teamId: string | undefined
): string | undefined {
  if (stored?.trim()) return stored.trim();
  if (teamId?.trim()) return teamLogoPath(league, teamId);
  return undefined;
}

function formatReleased(createdAt: string, updatedAt: string) {
  const revised = new Date(updatedAt).getTime() > new Date(createdAt).getTime() + 60_000;
  const ref = revised ? updatedAt : createdAt;
  const diffMs = Date.now() - new Date(ref).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) {
    return `${revised ? "Revised" : "Released"} ${mins} minute(s) ago`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${revised ? "Revised" : "Released"} ${hrs} hour(s) ago`;
  return `${revised ? "Revised" : "Released"} ${formatDateET(ref)}`;
}

function analysisParagraphs(detailedAnalysis?: string) {
  if (!detailedAnalysis?.trim()) return [];
  return detailedAnalysis
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !/^play\s*:/i.test(p));
}

function trackRecordSource(feed: PaidPickFeed): "smartedge" | "handicapper" {
  return feed === "admin" ? "smartedge" : "handicapper";
}

function feedLabel(feed: PaidPickFeed) {
  return feed === "admin" ? "SmartEdge® VIP" : "Jonah VIP";
}

function TeamSide({ name, logoSrc }: { name: string; logoSrc: string | undefined }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3 px-2 sm:gap-4">
      <div className="flex size-20 items-center justify-center sm:size-24">
        {logoSrc ? (
          <BrandImage
            src={logoSrc}
            alt=""
            width={96}
            height={96}
            className="max-h-full max-w-full object-contain"
            fallback={
              <span className="text-xl font-bold text-accent/80">
                {name.slice(0, 2).toUpperCase()}
              </span>
            }
          />
        ) : (
          <span className="text-xl font-bold text-accent/80">{name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <p className="max-w-40 text-center text-sm font-semibold leading-snug text-white sm:text-base">
        {name}
      </p>
    </div>
  );
}

type DashboardPickDetailCardProps = {
  pick: PaidPick;
  feed: PaidPickFeed;
  showFullAnalysis?: boolean;
};

export function DashboardPickDetailCard({ pick, feed, showFullAnalysis = true }: DashboardPickDetailCardProps) {
  const source = trackRecordSource(feed);
  const leagueMark = getSportsLeagueLogo(pick.league) ?? getPickLeagueLogo(pick.league);
  const angleParagraphs = analysisParagraphs(pick.detailedAnalysis);
  const betLabel = betTypeLabel(pick.betType);
  const isLocked = pick.odds === "Locked";

  const awayName = pick.awayTeamName?.trim() || "Away";
  const homeName = pick.homeTeamName?.trim() || "Home";
  const awayLogo = teamLogo(pick.awayTeamLogo, pick.league, pick.awayTeamId);
  const homeLogo = teamLogo(pick.homeTeamLogo, pick.league, pick.homeTeamId);

  return (
    <div className={isLocked ? "relative" : ""}>
      {isLocked && (
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
      <article className={cn("flex h-full w-full flex-col overflow-hidden rounded-2xl border-5 border-[#F5F4F4] bg-black ring-1 ring-green-500/40", isLocked && "pointer-events-none select-none")}>
      {pick.isPickOfDay && (
        <div className="pricing-accent-gradient gradient-animate border-b border-orange-500/50 px-5 py-3 text-center shadow-[0_4px_16px_rgb(212_98_56/0.3)]">
          <span className="text-base font-black uppercase tracking-widest text-white sm:text-lg">
            Lock of the Day
          </span>
        </div>
      )}
      <header className="relative flex min-h-22 items-center justify-center border-b border-green-500/50 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col items-center gap-2 text-center">
          {leagueMark ? (
            <Image
              src={leagueMark}
              alt={leagueDisplayName(pick.league)}
              width={72}
              height={72}
              className="size-14 object-contain opacity-95 sm:size-16"
            />
          ) : (
            <span className="flex size-14 items-center justify-center text-lg font-bold uppercase text-accent/80 sm:size-16">
              {pick.league.slice(0, 3)}
            </span>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 sm:text-sm">
            {leagueDisplayName(pick.league)}
          </span>
        </div>
        <div className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col items-end gap-2 sm:right-6">
          {pick.result && (
            <span className={cn(
              "inline-flex w-fit shrink-0 items-center gap-3 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)]",
              pick.result === "won" ? "bg-emerald-500/30 text-emerald-200 border border-emerald-500/50" : pick.result === "lost" ? "bg-rose-500/30 text-rose-200 border border-rose-500/50" : "bg-yellow-500/30 text-yellow-200 border border-yellow-500/50"
            )}>
              {pick.result === "won" ? (
                <>
                  <CheckCircle2 className="size-5 sm:size-6" />
                  Won
                </>
              ) : pick.result === "lost" ? (
                <>
                  <XCircle className="size-5 sm:size-6" />
                  Lost
                </>
              ) : (
                <>
                  <Clock className="size-5 sm:size-6" />
                  Pending
                </>
              )}
            </span>
          )}
          {pick.confidence != null && pick.confidence > 0 && (
            <span className="pricing-accent-gradient inline-flex w-fit shrink-0 items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)]">
              {feedLabel(feed)} · {pick.confidence}%
            </span>
          )}
        </div>
      </header>

      <section className="border-b border-green-500/40 px-5 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 sm:gap-8">
          <TeamSide name={awayName} logoSrc={awayLogo} />
          <span className="shrink-0 text-lg font-light text-zinc-600">VS</span>
          <TeamSide name={homeName} logoSrc={homeLogo} />
        </div>
        <p className="mt-5 text-center">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300">
            {betLabel}
          </span>
        </p>
        <div className="mt-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Match Time
          </p>
          <p className="mt-1.5 text-sm text-white">
            {pick.matchTime ? formatDateTimeLongET(pick.matchTime) : "TBD"}
          </p>
        </div>
      </section>

      <section className={cn("grid gap-px border-b border-green-500/40 bg-white/5 sm:grid-cols-2", isLocked && "blur-sm")}>
        <div className="bg-black/40 px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-4">
            <div>
              <p className="text-lg sm:text-xl font-bold text-green-400">{pick.pickTitle}</p>
            </div>
            {pick.odds.trim() ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Odds:</span>
                <span className="text-xl sm:text-2xl font-bold text-green-400">{pick.odds.trim()}</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="bg-black/40 px-5 py-5 sm:border-l sm:border-green-500/40 sm:px-6 sm:py-6 flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Pick Posted Time</p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatDateTimeLongET(pick.createdAt)}
          </p>
        </div>
      </section>

      <section className={cn("relative flex flex-1 flex-col space-y-4 px-5 py-5 sm:px-6 sm:py-6", isLocked && "blur-sm")}>
        {angleParagraphs.length > 0 && (
          <>
            <h4 className="shrink-0 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Expert Analysis
            </h4>
            <div className={`min-h-0 flex-1 space-y-3 ${!showFullAnalysis ? "blur-sm" : ""}`}>
              {angleParagraphs.map((para, i) => (
                <p key={i} className="text-[15px] leading-[1.7] text-zinc-300">
                  {para}
                </p>
              ))}
            </div>
            {!showFullAnalysis && (
              <Link href="/#pricing" className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60">
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">Full Analysis Available</p>
                  <p className="mt-1 text-xs text-zinc-300">Upgrade to {feedLabel(feed)} to unlock</p>
                  <Button className="pricing-accent-gradient mt-3 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99]">
                    Upgrade Now
                  </Button>
                </div>
              </Link>
            )}
          </>
        )}
        <div className="mt-auto shrink-0 space-y-4 border-t border-green-500/40 pt-4">
          <p className="text-sm leading-relaxed text-zinc-500">{TRACK_RECORD_LINE[source]}</p>
          <p className="text-right text-xs text-zinc-600">
            {formatReleased(pick.createdAt, pick.updatedAt)}
          </p>
        </div>
      </section>
    </article>
    </div>
  );
}
