"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { BrandImage } from "@/components/ui/brand-image";
import { leagueDisplayName, TRACK_RECORD_LINE } from "@/components/landing/free-picks-content";
import { getPickLeagueLogo, getSportsLeagueLogo } from "@/lib/sports-leagues";
import type { PublicPick, PublicPickSource } from "@/lib/api/picksApi";
import { BET_TYPE_LABELS, type BetType } from "@/types/picks";
import { teamLogoPath } from "@/types/picks";
import { formatDateET, formatDateTimeLongET } from "@/lib/datetime";
import { cn } from "@/lib/utils";

function betTypeLabel(betType: string) {
  return betType in BET_TYPE_LABELS ? BET_TYPE_LABELS[betType as BetType] : betType;
}

function teamLogo(
  stored: string | undefined,
  league: PublicPick["league"],
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

function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAuthorBio(name: string): { displayName: string; bio?: string } {
  if (name === "Dustin") {
    return {
      displayName: "D.D.",
      bio: "The Renaissance Man",
    };
  }
  if (name === "Jonah") {
    return {
      displayName: "Jonah",
    };
  }
  return { displayName: authorInitials(name) };
}

function TeamSide({
  name,
  logoSrc,
}: {
  name: string;
  logoSrc: string | undefined;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3 px-2 sm:gap-4">
      <div className="flex size-24 items-center justify-center sm:size-28 md:size-32">
        {logoSrc ? (
          <BrandImage
            src={logoSrc}
            alt=""
            width={128}
            height={128}
            className="max-h-full max-w-full object-contain"
            fallback={
              <span className="text-2xl font-bold text-accent/80 sm:text-3xl">
                {name.slice(0, 2).toUpperCase()}
              </span>
            }
          />
        ) : (
          <span className="text-2xl font-bold text-accent/80 sm:text-3xl">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <p className="max-w-40 text-center text-base font-semibold leading-snug text-white sm:text-lg">
        {name}
      </p>
    </div>
  );
}

type FreePickDetailCardProps = {
  pick: PublicPick;
  source: PublicPickSource;
  featured?: boolean;
  isAdmin?: boolean;
};

export function FreePickDetailCard({ pick, source, featured, isAdmin }: FreePickDetailCardProps) {
  const { data: session } = useSession();
  const authorName =
    pick.createdBy?.name ?? (source === "smartedge" ? "SmartEdge® Desk" : "Featured Expert");
  const { displayName, bio } = getAuthorBio(authorName);
  const leagueMark = getSportsLeagueLogo(pick.league) ?? getPickLeagueLogo(pick.league);
  const angleParagraphs = analysisParagraphs(pick.detailedAnalysis);
  const betLabel = betTypeLabel(pick.betType);

  const awayName = pick.awayTeamName?.trim() || "Away";
  const homeName = pick.homeTeamName?.trim() || "Home";
  const awayLogo = teamLogo(pick.awayTeamLogo, pick.league, pick.awayTeamId);
  const homeLogo = teamLogo(pick.homeTeamLogo, pick.league, pick.homeTeamId);

  const pickTitle = pick.pickTitle.trim();
  const odds = pick.odds.trim();

  const isLocked = !isAdmin && pick.access !== "free";

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-2xl border-5 border-[#F5F4F4] bg-black ring-1 ring-green-500/40">
      {pick.isPickOfDay && (
        <div className="pricing-accent-gradient gradient-animate border-b border-orange-500/50 px-5 py-3 text-center shadow-[0_4px_16px_rgb(212_98_56/0.3)]">
          <span className="text-base font-black uppercase tracking-widest text-white sm:text-lg">
            Lock of the Day
          </span>
        </div>
      )}
      {/* Author */}
      <header className="flex flex-col gap-4 border-b border-green-500/40 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7 sm:py-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/15 text-2xl font-bold text-accent ring-2 ring-accent/25 sm:size-28 sm:text-3xl">
            {source === "handicapper" ? (
              <Image
                src="/social/jonah.jpeg"
                alt="Jonah"
                width={112}
                height={112}
                className="size-full object-cover"
              />
            ) : source === "smartedge" ? (
              <Image
                src="/social/dustin.jpeg"
                alt="Dustin"
                width={112}
                height={112}
                className="size-full object-cover"
              />
            ) : (
              displayName
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{displayName}</h3>
            {bio && <p className="mt-0.5 text-sm italic text-zinc-400">"{bio}"</p>}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {leagueMark ? (
                <Image
                  src={leagueMark}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 object-contain opacity-90"
                />
              ) : null}
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                {leagueDisplayName(pick.league)}
              </span>
            </div>
            <Link
              href="/#meet-experts"
              className="mt-2 inline-block text-sm text-zinc-500 transition hover:text-accent"
            >
              View profile →
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {pick.result && (
            <span className={cn(
              "inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)]",
              pick.result === "won" ? "bg-emerald-500/30 text-emerald-200 border border-emerald-500/50" : pick.result === "lost" ? "bg-rose-500/30 text-rose-200 border border-rose-500/50" : "bg-yellow-500/30 text-yellow-200 border border-yellow-500/50"
            )}>
              {pick.result === "won" ? (
                <>
                  <CheckCircle2 className="size-4" />
                  Won
                </>
              ) : pick.result === "lost" ? (
                <>
                  <XCircle className="size-4" />
                  Lost
                </>
              ) : (
                <>
                  <Clock className="size-4" />
                  Pending
                </>
              )}
            </span>
          )}
          <span className="pricing-accent-gradient inline-flex w-fit shrink-0 items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)]">
            {source === "smartedge" ? "SmartEdge® VIP" : "Jonah VIP"}{pick.confidence ? ` · ${pick.confidence}% confidence` : ""}
          </span>
        </div>
      </header>

      {/* Matchup hero */}
      <section className="border-b border-green-500/40 px-5 py-8 sm:px-7 sm:py-10">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2 sm:gap-4">
          <TeamSide name={awayName} logoSrc={awayLogo} />
          <div className="flex shrink-0 flex-col items-center gap-2 px-1">
            <span className="text-lg font-light text-zinc-600 sm:text-xl">@</span>
          </div>
          <TeamSide name={homeName} logoSrc={homeLogo} />
        </div>
        <p className="mt-6 text-center">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300">
            {betLabel}
          </span>
        </p>
      </section>

      {/* Date & play */}
      <section className={cn("grid gap-px border-b border-green-500/40 bg-white/5 sm:grid-cols-2", isLocked && "blur-sm")}>
        <div className="bg-black/40 px-5 py-5 sm:px-7 sm:py-6">
          <div className="space-y-4">
            <div>
              <p className="text-lg sm:text-xl font-bold text-green-400">{pickTitle}</p>
            </div>
            {odds ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Odds:</span>
                <span className="text-xl sm:text-2xl font-bold text-green-400">{odds}</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="bg-black/40 px-5 py-5 sm:border-l sm:border-green-500/40 sm:px-7 sm:py-6 flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Pick Posted Time
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {formatDateTimeLongET(pick.createdAt)}
          </p>
        </div>
      </section>

      {/* Analysis */}
      <section className="relative flex flex-1 flex-col space-y-4 px-5 py-6 sm:px-7 sm:py-8">
        {angleParagraphs.length > 0 && (
          <>
            <h4 className="shrink-0 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Expert Analysis
            </h4>
            <div className={cn("space-y-4", isLocked && "blur-sm")}>
              {angleParagraphs.map((para, i) => (
                <p key={i} className="text-[15px] leading-[1.7] text-zinc-300">
                  {para}
                </p>
              ))}
            </div>
          </>
        )}
        <div className="mt-auto shrink-0 space-y-4 border-t border-green-500/40 pt-4">
          <p className="text-sm leading-relaxed text-zinc-500">
            {TRACK_RECORD_LINE[source]}
          </p>
          <p className="text-right text-xs text-zinc-600">
            {formatReleased(pick.createdAt, pick.updatedAt)}
          </p>
        </div>
      </section>
    </article>
  );
}
