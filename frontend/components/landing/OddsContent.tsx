"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Activity, TrendingUp, ExternalLink, Calendar } from "lucide-react";
import { BrandImage } from "@/components/ui/brand-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";
import { OddsSportSubNav } from "@/components/landing/OddsSportSubNav";
import { useLiveOdds, type Game } from "@/lib/hooks/useOdds";
import { useHistoricalOdds, type HistoricalGame } from "@/lib/hooks/useHistoricalOdds";
import { oddsSportLogo, type OddsSport } from "./odds-data";

const MLB_TEAM_LOGOS: Record<string, string> = {
  "Arizona Diamondbacks": "Arizona Diamondba.png",
  "Atlanta Braves": "Atlanta Braves.png",
  "Baltimore Orioles": "Baltimore Orioles.png",
  "Boston Red Sox": "Boston Red Sox.png",
  "Chicago Cubs": "Chicago Cubs.png",
  "Chicago White Sox": "Chicago White Sox.png",
  "Cincinnati Reds": "Cincinnati Reds.png",
  "Cleveland Guardians": "Cleveland Guardia.png",
  "Colorado Rockies": "Colorado Rockies.png",
  "Detroit Tigers": "Detroit Tigers.png",
  "Houston Astros": "Houston Astros.png",
  "Kansas City Royals": "Kansas City Royal.png",
  "Los Angeles Angels": "Los Angeles Angel.png",
  "Los Angeles Dodgers": "Los Angeles Dodge.png",
  "Miami Marlins": "Miami Marlins.png",
  "Milwaukee Brewers": "Milwaukee Brewers.png",
  "Minnesota Twins": "Minnesota Twins.png",
  "New York Mets": "New York Mets.png",
  "New York Yankees": "New York Yankees.png",
  "Philadelphia Phillies": "Philadelphia Phil.png",
  "Pittsburgh Pirates": "Pittsburgh Pirate.png",
  "San Diego Padres": "San Diego Padres.png",
  "San Francisco Giants": "San Francisco Gia.png",
  "Seattle Mariners": "Seattle Mariners.png",
  "St. Louis Cardinals": "St. Louis Cardina.png",
  "Tampa Bay Rays": "Tampa Bay Rays.png",
  "Texas Rangers": "Texas Rangers.png",
  "Toronto Blue Jays": "Toronto Blue Jays.png",
  "Washington Nationals": "Washington Nation.png",
  "Oakland Athletics": "Athletics.png",
};

function getTeamLogo(teamName: string): string {
  const logoFile = MLB_TEAM_LOGOS[teamName];
  if (logoFile) {
    return `/leagues/mlb/${encodeURIComponent(logoFile)}`;
  }
  return "";
}

const SPORTSBOOK_LOGO_FILES: Record<string, string> = {
  fanduel: "fanduel.webp",
  draftkings: "DraftKings.png",
  betmgm: "BetMGM.png",
  caesars: "caesars.jpg",
  williamhill_us: "caesars.jpg",
  fanatics: "Fanatics.png",
  mybookie: "MyBookie.ag.jpg",
  "mybookie.ag": "MyBookie.ag.jpg",
  betus: "BetUS.png",
  lowvig: "LowVig.ag.jpg",
  bovada: "Bovada.png",
};

function getSportsbookLogo(bookmakerKey: string): string {
  if (!bookmakerKey) return "";
  const normalizedKey = bookmakerKey.toLowerCase().trim();
  if (SPORTSBOOK_LOGO_FILES[normalizedKey]) {
    return `/sportsbooks/${SPORTSBOOK_LOGO_FILES[normalizedKey]}`;
  }
  const baseName = normalizedKey.split(".")[0];
  if (SPORTSBOOK_LOGO_FILES[baseName]) {
    return `/sportsbooks/${SPORTSBOOK_LOGO_FILES[baseName]}`;
  }
  for (const [key, file] of Object.entries(SPORTSBOOK_LOGO_FILES)) {
    if (normalizedKey.includes(key) || key.includes(baseName)) {
      return `/sportsbooks/${file}`;
    }
  }
  return "";
}

function formatCommenceTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCommenceTimeOnly(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatOdds(price: number | null): string {
  if (price === null) return "—";
  return price > 0 ? `+${price}` : String(price);
}

interface OddsContentProps {
  sport: OddsSport;
  onSportChange: (sport: OddsSport) => void;
}

function OddsTable({ games, sport }: { games: Game[]; sport: OddsSport }) {
  const sportsbooks = Array.from(
    new Map(
      games
        .flatMap((g) => g.bookmakers)
        .map((b) => [b.key, b.title])
    ).entries()
  );

  const handleGameClick = (game: Game) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedGame", JSON.stringify(game));
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="bg-linear-to-r from-[#ED723C] to-[#ED723C]/80 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-32 sm:w-40 md:w-48 shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white opacity-90">Sportsbooks</p>
              </div>
            </div>
          </div>

          {/* Sportsbook Column Headers */}
          <div className="bg-white/5 border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-32 sm:w-40 md:w-48 shrink-0"></div>
              <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                {sportsbooks.map(([key, title]) => {
                  const logoUrl = getSportsbookLogo(key);
                  return (
                    <div key={key} className="flex-1 text-center flex items-center justify-center min-h-10 sm:min-h-12">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={title}
                          width={80}
                          height={40}
                          className="h-6 sm:h-8 md:h-10 w-auto object-contain rounded-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <p className="text-[10px] sm:text-xs font-semibold text-zinc-300 truncate">{title}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Game Rows */}
          {games.map((game) => {
            const detailLink = `/odds/${game.id}`;
            return (
              <Link key={game.id} href={detailLink} onClick={() => handleGameClick(game)} className="block">
                {/* Away Team Row */}
                <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-32 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                      {getTeamLogo(game.away_team) ? (
                        <Image
                          src={getTeamLogo(game.away_team)}
                          alt={game.away_team}
                          width={36}
                          height={36}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                        />
                      ) : null}
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-white mb-0.5 sm:mb-1">
                          {formatCommenceTimeOnly(game.commence_time)} ET
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.away_team}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Moneyline</p>
                        {game.is_live && (
                          <span className="inline-flex text-[9px] sm:text-[10px] font-bold text-white bg-red-500/80 px-1.5 sm:px-2 py-0.5 rounded-full w-fit mt-0.5">
                            LIVE
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                      {sportsbooks.map(([bookmakerId]) => {
                        const bookmaker = game.bookmakers.find((b) => b.key === bookmakerId);
                        const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === "h2h");
                        const awayOdds = h2hMarket?.outcomes?.find((o: any) => o.name === game.away_team)?.price ?? null;
                        return (
                          <div key={bookmakerId} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                            <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                              {formatOdds(awayOdds)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Home Team Row */}
                <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-32 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                      {getTeamLogo(game.home_team) ? (
                        <Image
                          src={getTeamLogo(game.home_team)}
                          alt={game.home_team}
                          width={36}
                          height={36}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                        />
                      ) : null}
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-white mb-0.5 sm:mb-1">
                          {formatCommenceTimeOnly(game.commence_time)} ET
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.home_team}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Moneyline</p>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                      {sportsbooks.map(([bookmakerId]) => {
                        const bookmaker = game.bookmakers.find((b) => b.key === bookmakerId);
                        const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === "h2h");
                        const homeOdds = h2hMarket?.outcomes?.find((o: any) => o.name === game.home_team)?.price ?? null;
                        return (
                          <div key={bookmakerId} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                            <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                              {formatOdds(homeOdds)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HistoricalOddsTable({ games }: { games: HistoricalGame[] }) {
  const sportsbooks = Array.from(
    new Map(
      games
        .flatMap((g) => g.bookmakers)
        .map((b) => [b.key, b.title])
    ).entries()
  );

  const handleGameClick = (game: HistoricalGame) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedGame", JSON.stringify(game));
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="bg-linear-to-r from-[#ED723C] to-[#ED723C]/80 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-32 sm:w-40 md:w-48 shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white opacity-90">Sportsbooks</p>
              </div>
            </div>
          </div>

          {/* Sportsbook Column Headers */}
          <div className="bg-white/5 border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-32 sm:w-40 md:w-48 shrink-0"></div>
              <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                {sportsbooks.map(([key, title]) => {
                  const logoUrl = getSportsbookLogo(key);
                  return (
                    <div key={key} className="flex-1 text-center flex items-center justify-center min-h-10 sm:min-h-12">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={title}
                          width={80}
                          height={40}
                          className="h-6 sm:h-8 md:h-10 w-auto object-contain rounded-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <p className="text-[10px] sm:text-xs font-semibold text-zinc-300 truncate">{title}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Game Rows */}
          {games.map((game) => {
            const detailLink = `/odds/${game.id}`;
            return (
              <Link key={game.id} href={detailLink} onClick={() => handleGameClick(game)} className="block">
                {/* Away Team Row */}
                <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-32 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                      {getTeamLogo(game.away_team) ? (
                        <Image
                          src={getTeamLogo(game.away_team)}
                          alt={game.away_team}
                          width={36}
                          height={36}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                        />
                      ) : null}
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-white mb-0.5 sm:mb-1">
                          {formatCommenceTimeOnly(game.commence_time)} ET
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.away_team}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Moneyline</p>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                      {sportsbooks.map(([bookmakerId]) => {
                        const bookmaker = game.bookmakers.find((b) => b.key === bookmakerId);
                        const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === "h2h");
                        const awayOdds = h2hMarket?.outcomes?.find((o: any) => o.name === game.away_team)?.price ?? null;
                        return (
                          <div key={bookmakerId} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                            <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                              {formatOdds(awayOdds)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Home Team Row */}
                <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-32 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                      {getTeamLogo(game.home_team) ? (
                        <Image
                          src={getTeamLogo(game.home_team)}
                          alt={game.home_team}
                          width={36}
                          height={36}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                        />
                      ) : null}
                      <div className="flex flex-col min-w-0">
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-white mb-0.5 sm:mb-1">
                          {formatCommenceTimeOnly(game.commence_time)} ET
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.home_team}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Moneyline</p>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                      {sportsbooks.map(([bookmakerId]) => {
                        const bookmaker = game.bookmakers.find((b) => b.key === bookmakerId);
                        const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === "h2h");
                        const homeOdds = h2hMarket?.outcomes?.find((o: any) => o.name === game.home_team)?.price ?? null;
                        return (
                          <div key={bookmakerId} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                            <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                              {formatOdds(homeOdds)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OddsTableSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="bg-linear-to-r from-[#ED723C] to-[#ED723C]/80 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-32 sm:w-40 md:w-48 shrink-0"></div>
              <div className="flex-1">
                <Skeleton className="h-4 w-24 bg-white/20" />
              </div>
            </div>
          </div>

          {/* Sportsbook Header */}
          <div className="bg-white/5 border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-32 sm:w-40 md:w-48 shrink-0"></div>
              <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-1 flex items-center justify-center min-h-10 sm:min-h-12">
                    <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 bg-white/10 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row Skeletons */}
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-32 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                  <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded shrink-0" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-16 bg-white/10" />
                    <Skeleton className="h-3 sm:h-3.5 w-24 sm:w-28 bg-white/10" />
                    <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-16 bg-white/10" />
                  </div>
                </div>
                <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 flex items-center justify-center min-h-10 sm:min-h-12">
                      <Skeleton className="h-3.5 sm:h-4 w-10 sm:w-12 bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OddsContent({ sport, onSportChange }: OddsContentProps) {
  const [viewMode, setViewMode] = useState<"live" | "historical">("live");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  // React Query hooks for smart caching
  const { data: apiGames = [], isLoading: isLoadingLive, error: liveError } = useLiveOdds(sport);
  const { data: historicalGames = [], isLoading: isLoadingHistorical } = useHistoricalOdds(selectedDate, viewMode === "historical");

  const isLoading = viewMode === "live" ? isLoadingLive : isLoadingHistorical;

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;

    const dateStr = date.toISOString().split("T")[0];
    setSelectedDate(dateStr);
    setShowCalendar(false);
    // React Query will automatically fetch the new data for the new date
  };

  const sportLogo = oddsSportLogo(sport);

  return (
    <div className="relative z-10 flex flex-1 flex-col">
      <OddsSportSubNav sport={sport} onSportChange={onSportChange} />

      <div className="mx-auto w-full max-w-7-5xl px-3 pb-16 pt-4 sm:px-5 sm:pb-24 sm:pt-6 md:px-6 md:pb-32 md:pt-8">
        <div className="mx-auto max-w-3xl text-center px-2 sm:px-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] sm:text-[13px] text-zinc-300">
            {sportLogo ? (
              <span className="flex size-5 items-center justify-center overflow-hidden">
                <BrandImage
                  src={sportLogo}
                  alt=""
                  width={20}
                  height={20}
                  className="h-4 w-4 object-contain"
                />
              </span>
            ) : (
              <Activity className="size-3.5 text-white" strokeWidth={1.75} />
            )}
            {viewMode === "live" ? "Live market lines" : "Historical odds"} · {sport}
          </div>
          <h1 className="typo-hero-title mt-6 text-white">Odds Board</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-subtle md:text-xl">
            {viewMode === "live"
              ? isLoading
                ? "Loading live odds..."
                : "Compare moneyline odds across all sportsbooks."
              : "View historical odds data for past games."}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-4">
          <button
            onClick={() => setViewMode("live")}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
              viewMode === "live"
                ? "bg-[#ED723C] text-white"
                : "bg-white/10 text-zinc-400 hover:bg-white/20"
            }`}
          >
            Live Odds
          </button>
          <button
            onClick={() => setViewMode("historical")}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-all flex items-center gap-2 ${
              viewMode === "historical"
                ? "bg-[#ED723C] text-white"
                : "bg-white/10 text-zinc-400 hover:bg-white/20"
            }`}
          >
            <Calendar className="size-4" />
            Historical Odds
          </button>
        </div>

        {/* Date Picker for Historical View */}
        {viewMode === "historical" && (
          <div className="mt-6 space-y-4">
            <p className="text-center text-sm text-zinc-500">
              Select a date to view the historical odds
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <label className="text-sm font-medium text-zinc-400">Select Date:</label>
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <Calendar className="size-4" />
                  <span className="text-sm font-medium">{selectedDate}</span>
                </button>
                {showCalendar && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 z-50 bg-black border border-white/20 rounded-lg shadow-xl p-4">
                    <CalendarComponent
                      mode="single"
                      selected={new Date(selectedDate)}
                      onSelect={handleDateChange}
                      disabled={(date) => date > new Date()}
                      className="rounded-md border border-white/10"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 sm:mt-10 flex items-center justify-center gap-2 text-[11px] sm:text-[13px] text-zinc-500">
          <TrendingUp className="size-3.5 text-white" />
          <span>
            Showing{" "}
            <span className="font-medium text-zinc-300">
              {viewMode === "live" ? apiGames.length : historicalGames.length}
            </span>{" "}
            games · <span className="font-medium text-zinc-300">{sport}</span>
          </span>
        </div>

        <div className="mt-6" role="tabpanel">
          {viewMode === "live" ? (
            <>
              {isLoading ? (
                <OddsTableSkeleton />
              ) : apiGames.length > 0 ? (
                <OddsTable games={apiGames} sport={sport} />
              ) : (
                <div className="flex justify-center py-8">
                  <div className="text-sm text-zinc-400">No live games available at the moment</div>
                </div>
              )}
            </>
          ) : (
            <>
              {isLoading ? (
                <OddsTableSkeleton />
              ) : historicalGames.length > 0 ? (
                <HistoricalOddsTable games={historicalGames} />
              ) : (
                <div className="flex justify-center py-8">
                  <div className="text-sm text-zinc-400">
                    No historical games found for {selectedDate}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-zinc-600">
          {viewMode === "live"
            ? "Live odds data coming soon. Real-time MLB games and sportsbook comparison will appear here."
            : "Historical odds data is updated daily with past game information."}
        </p>

        <div className="mx-auto mt-8 sm:mt-12 flex max-w-md flex-col items-center gap-3 sm:gap-4 text-center px-4 sm:px-0">
          <p className="text-sm text-zinc-400">
            Want model-backed picks with confidence scores on these matchups?
          </p>
          <PricingAccentButton href="/#pricing" fullWidth={false} className="typo-button-md">
            View pick plans
          </PricingAccentButton>
          <Link href="/#pricing" className="text-sm text-zinc-500 transition hover:text-zinc-300">
            Or create a free account →
          </Link>
        </div>
      </div>
    </div>
  );
}
