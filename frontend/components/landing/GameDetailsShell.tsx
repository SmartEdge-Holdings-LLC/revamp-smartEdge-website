"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameDetails } from "@/lib/hooks/useGameDetails";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

interface Outcome {
  name: string;
  price: number;
  point?: number;
}

interface Market {
  key: string;
  outcomes: Outcome[];
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface GameData {
  id: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: Bookmaker[];
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

  // Normalize the key to lowercase
  const normalizedKey = bookmakerKey.toLowerCase().trim();
  console.log(`getSportsbookLogo called with: "${bookmakerKey}" (normalized: "${normalizedKey}")`);

  // Try exact match
  if (SPORTSBOOK_LOGO_FILES[normalizedKey]) {
    console.log(`✓ Found exact match: ${normalizedKey}`);
    return `/sportsbooks/${SPORTSBOOK_LOGO_FILES[normalizedKey]}`;
  }

  // Try matching by domain base (e.g., "mybookie.ag" -> "mybookie")
  const baseName = normalizedKey.split(".")[0];
  if (SPORTSBOOK_LOGO_FILES[baseName]) {
    console.log(`✓ Found base name match: ${baseName}`);
    return `/sportsbooks/${SPORTSBOOK_LOGO_FILES[baseName]}`;
  }

  // Try partial matching for common variations
  for (const [key, file] of Object.entries(SPORTSBOOK_LOGO_FILES)) {
    if (normalizedKey.includes(key) || key.includes(baseName)) {
      console.log(`✓ Found partial match: ${key} -> ${file}`);
      return `/sportsbooks/${file}`;
    }
  }

  console.log(`✗ No match found for: "${normalizedKey}"`);
  return "";
}

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
    return `/leagues/mlb/${logoFile}`;
  }
  return "";
}

function formatOdds(price: number | null | undefined): string {
  if (price === null || price === undefined) return "—";
  return price > 0 ? `+${price}` : String(price);
}

function formatCommenceTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function GameDetailsShell({ gameId }: { gameId: string }) {
  const [selectedMarket, setSelectedMarket] = useState<"spreads" | "totals" | "h2h" | "all">("all" as const);
  const { data: game, isLoading, isPending, error } = useGameDetails(gameId);

  const getMarketLabel = (value: string) => {
    switch (value) {
      case "all":
        return "All Markets";
      case "spreads":
        return "Spread";
      case "totals":
        return "Over/Under";
      case "h2h":
        return "Moneyline";
      default:
        return "Select market type";
    }
  };

  if (isLoading || isPending) {
    return (
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-8xl px-4 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-6 md:px-6 md:pb-10 md:pt-8">
          {/* Back button skeleton */}
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 bg-white/10 mb-6 sm:mb-8 rounded" />

          {/* Title skeleton */}
          <Skeleton className="h-5 sm:h-7 md:h-8 w-full max-w-lg sm:max-w-2xl bg-white/10 mb-4 sm:mb-8 rounded" />

          {/* Game Matchup Card skeleton */}
          <div className="rounded-xl overflow-hidden shadow-2xl mb-6 sm:mb-10">
            <div className="bg-linear-to-r from-red-950 via-black to-green-950 p-4 sm:p-8 md:p-12 lg:p-16">
              <div className="flex items-center justify-between">
                {/* Away Team */}
                <div className="flex-1 flex flex-col items-center gap-2 sm:gap-4">
                  <Skeleton className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/10 rounded-lg" />
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-32 bg-white/10 rounded" />
                </div>
                {/* VS */}
                <div className="flex flex-col items-center gap-2 sm:gap-6 px-2 sm:px-4 md:px-8">
                  <Skeleton className="h-6 sm:h-10 md:h-12 w-10 sm:w-14 bg-white/10 rounded" />
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-40 bg-white/10 rounded" />
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-24 bg-white/10 rounded" />
                </div>
                {/* Home Team */}
                <div className="flex-1 flex flex-col items-center gap-2 sm:gap-4">
                  <Skeleton className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/10 rounded-lg" />
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-32 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Odds Section Container skeleton */}
          <div className="bg-black rounded-xl border border-white/10 overflow-hidden mb-8 sm:mb-12">
            {/* Market Switcher Header */}
            <div className="border-b border-white/10 px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
              <div>
                <Skeleton className="h-4 sm:h-5 w-40 sm:w-56 bg-white/10 rounded mb-1.5" />
                <Skeleton className="h-3 w-28 sm:w-36 bg-white/10 rounded" />
              </div>
              <Skeleton className="h-9 sm:h-10 w-full sm:w-40 bg-white/10 rounded-lg" />
            </div>

            {/* Table skeleton */}
            <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-150">
                  {/* Orange Header */}
                  <div className="bg-linear-to-r from-[#ED723C] to-[#ED723C]/80 px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-28 sm:w-40 md:w-48 shrink-0"></div>
                      <Skeleton className="h-3 sm:h-4 w-20 bg-white/20 rounded" />
                    </div>
                  </div>

                  {/* Sportsbook Logos */}
                  <div className="bg-white/5 border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-28 sm:w-40 md:w-48 shrink-0"></div>
                      <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex-1 flex items-center justify-center min-h-10 sm:min-h-12">
                            <Skeleton className="h-6 sm:h-8 md:h-10 w-14 sm:w-20 bg-white/10 rounded-md" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Data Rows */}
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-28 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                          <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-white/10 rounded shrink-0" />
                          <div className="flex flex-col gap-1">
                            <Skeleton className="h-2 sm:h-2.5 w-12 sm:w-14 bg-white/10 rounded" />
                            <Skeleton className="h-2.5 sm:h-3.5 w-20 sm:w-28 bg-white/10 rounded" />
                            <Skeleton className="h-2 sm:h-2.5 w-12 sm:w-16 bg-white/10 rounded" />
                          </div>
                        </div>
                        <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 flex items-center justify-center min-h-10 sm:min-h-12">
                              <Skeleton className="h-3.5 sm:h-4 w-8 sm:w-12 bg-white/10 rounded" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game || !game.bookmakers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">
            {error ? "Failed to load game details" : "Game data not found"}
          </p>
          <Link href="/odds" className="text-accent hover:underline">
            Back to Odds
          </Link>
        </div>
      </div>
    );
  }

  const filteredBookmakers = game.bookmakers.filter(
    (bm) => bm.key !== "betonlineag" && bm.key !== "betrivers"
  );

  return (
    <div className="relative z-10 flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-8xl px-4 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-6 md:px-6 md:pb-10 md:pt-8">
        {/* Back button */}
        <Link
          href="/odds"
          className="inline-flex items-center gap-2 text-accent hover:opacity-80 mb-6 sm:mb-8 transition-opacity text-sm sm:text-base"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Odds
        </Link>

        {/* Page Title */}
        <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-8 leading-tight">
          {game.away_team} vs. {game.home_team} Odds & Betting Predictions - {formatCommenceTime(game.commence_time)} ET
        </h1>

        {/* Game Matchup Card */}
        <div className="rounded-xl overflow-hidden shadow-2xl mb-6 sm:mb-10">
          {/* Gradient Background - Dark red to dark green */}
          <div className="bg-linear-to-r from-red-950 via-black to-green-950 p-4 sm:p-8 md:p-12 lg:p-16">
            <div className="flex items-center justify-between">
              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center gap-2 sm:gap-4">
                <div className="w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center">
                  {getTeamLogo(game.away_team) && (
                    <Image
                      src={getTeamLogo(game.away_team)}
                      alt={game.away_team}
                      width={100}
                      height={100}
                      className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-xl"
                    />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-[11px] sm:text-base md:text-lg uppercase tracking-wide">
                    {game.away_team}
                  </p>
                </div>
              </div>

              {/* Center - VS */}
              <div className="flex flex-col items-center gap-2 sm:gap-6 px-2 sm:px-4 md:px-8">
                <div className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-400 drop-shadow-lg italic">
                  VS
                </div>
                <p className="text-[10px] sm:text-sm md:text-lg text-white tracking-widest text-center">
                  {formatCommenceTime(game.commence_time).split(" at ")[0]}
                </p>
                <p className="text-[10px] sm:text-sm md:text-lg text-green-400 tracking-widest text-center">
                  {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                </p>
              </div>

              {/* Home Team */}
              <div className="flex-1 flex flex-col items-center gap-2 sm:gap-4">
                <div className="w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center">
                  {getTeamLogo(game.home_team) && (
                    <Image
                      src={getTeamLogo(game.home_team)}
                      alt={game.home_team}
                      width={100}
                      height={100}
                      className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-xl"
                    />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-[11px] sm:text-base md:text-lg uppercase tracking-wide">
                    {game.home_team}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Odds Section Container */}
        <div className="bg-black rounded-xl border border-white/10 overflow-hidden mb-8 sm:mb-12">
          {/* Market Switcher Header */}
          <div className="border-b border-white/10 px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
            {/* Left Side - Descriptive Text */}
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-0.5 sm:mb-1">
                {game.away_team} at {game.home_team} Odds
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-zinc-400">
                Spread, Total, Moneyline
              </p>
            </div>

            {/* Right Side - Dropdown Selector */}
            <div className="min-w-0 sm:min-w-40">
              <Select value={selectedMarket} onValueChange={(value) => setSelectedMarket(value as any)}>
                <SelectTrigger className="bg-white/5 border-white/10 hover:border-[#ED723C]/50">
                  <span className="text-sm sm:text-base text-white font-medium">{getMarketLabel(selectedMarket)}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Markets</SelectItem>
                  <SelectItem value="spreads">Spread</SelectItem>
                  <SelectItem value="totals">Over/Under</SelectItem>
                  <SelectItem value="h2h">Moneyline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sports Betting Odds Table */}
          <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
           <div className="overflow-x-auto">
            <div className="min-w-150">
            {/* Header */}
            <div className="bg-linear-to-r from-[#ED723C] to-[#ED723C]/80 px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-28 sm:w-40 md:w-48 shrink-0"></div>
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs font-bold text-white opacity-90">Sportsbooks</p>
                </div>
              </div>
            </div>

            {/* Sportsbook Column Headers */}
            <div className="bg-white/5 border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-28 sm:w-40 md:w-48 shrink-0"></div>
                <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                  {filteredBookmakers.map((bookmaker) => {
                    const logoUrl = getSportsbookLogo(bookmaker.key);
                    return (
                      <div key={bookmaker.key} className="flex-1 text-center flex items-center justify-center min-h-10 sm:min-h-12">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={bookmaker.title}
                            width={80}
                            height={40}
                            className="h-6 sm:h-8 md:h-10 w-auto object-contain rounded-md"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <p className="text-[10px] sm:text-xs font-semibold text-zinc-300 truncate">{bookmaker.title}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Away Team Row(s) */}
            {selectedMarket === "all" ? (
              // Show three rows for all market types
              <>
                {/* Moneyline Row */}
                <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-28 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                      {game.away_team && getTeamLogo(game.away_team) ? (
                        <Image
                          src={getTeamLogo(game.away_team)}
                          alt={game.away_team}
                          width={36}
                          height={36}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="flex flex-col">
                        <p className="text-[10px] sm:text-xs text-white mb-1">
                          {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.away_team}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Moneyline</p>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                      {filteredBookmakers.map((bookmaker) => {
                        const h2hMarket = bookmaker.markets?.find((m: Market) => m.key === "h2h");
                        const h2hOdds = h2hMarket?.outcomes?.find((o: Outcome) => o.name === game.away_team);
                        return (
                          <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                            <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                              {h2hOdds?.price !== null && h2hOdds?.price !== undefined ? formatOdds(h2hOdds?.price) : "—"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Spread Row */}
                <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-28 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                      {game.away_team && getTeamLogo(game.away_team) ? (
                        <Image
                          src={getTeamLogo(game.away_team)}
                          alt={game.away_team}
                          width={36}
                          height={36}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="flex flex-col">
                        <p className="text-[10px] sm:text-xs text-white mb-1">
                          {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.away_team}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Spread</p>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                      {filteredBookmakers.map((bookmaker) => {
                        const spreadMarket = bookmaker.markets?.find((m: Market) => m.key === "spreads");
                        const spreadOdds = spreadMarket?.outcomes?.find((o: Outcome) => o.name === game.away_team);
                        return (
                          <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                            <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                              {spreadOdds?.price !== null && spreadOdds?.price !== undefined ? formatOdds(spreadOdds?.price) : "—"}
                            </p>
                            {spreadOdds?.point !== undefined && (
                              <p className="text-xs text-[#ED723C] font-semibold">{spreadOdds?.point}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Over/Under Row */}
                <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-28 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                      {game.away_team && getTeamLogo(game.away_team) ? (
                        <Image
                          src={getTeamLogo(game.away_team)}
                          alt={game.away_team}
                          width={36}
                          height={36}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="flex flex-col">
                        <p className="text-[10px] sm:text-xs text-white mb-1">
                          {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.away_team}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Over/Under</p>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                      {filteredBookmakers.map((bookmaker) => {
                        const totalMarket = bookmaker.markets?.find((m: Market) => m.key === "totals");
                        const totalOver = totalMarket?.outcomes?.[0];
                        return (
                          <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                            <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                              {totalOver?.price !== null && totalOver?.price !== undefined ? formatOdds(totalOver?.price) : "—"}
                            </p>
                            {totalOver?.point !== undefined && (
                              <p className="text-xs text-[#ED723C] font-semibold">
                                {totalOver.point > 0 ? "O" : "U"}{totalOver?.point}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Single row for specific market type
              <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Team Info */}
                  <div className="w-28 sm:w-40 md:w-48 shrink-0 flex items-center gap-1.5 sm:gap-2">
                    {game.away_team && getTeamLogo(game.away_team) ? (
                      <Image
                        src={getTeamLogo(game.away_team)}
                        alt={game.away_team}
                        width={36}
                        height={36}
                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-white mb-1">
                        {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                      </p>
                      <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.away_team}</p>
                    </div>
                  </div>

                  {/* Odds */}
                  <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                  {filteredBookmakers.map((bookmaker) => {
                    const spreadMarket = bookmaker.markets?.find((m: Market) => m.key === "spreads");
                    const totalMarket = bookmaker.markets?.find((m: Market) => m.key === "totals");
                    const h2hMarket = bookmaker.markets?.find((m: Market) => m.key === "h2h");

                    const spreadOdds = spreadMarket?.outcomes?.find((o: Outcome) => o.name === game.away_team);
                    const totalOver = totalMarket?.outcomes?.[0];
                    const h2hOdds = h2hMarket?.outcomes?.find((o: Outcome) => o.name === game.away_team);

                    let displayOdds: { price?: number; point?: number } | undefined;
                    if (selectedMarket === "spreads") {
                      displayOdds = spreadOdds;
                    } else if (selectedMarket === "totals") {
                      displayOdds = totalOver;
                    } else if (selectedMarket === "h2h") {
                      displayOdds = h2hOdds;
                    }

                    return (
                      <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                        <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                          {displayOdds?.price !== null && displayOdds?.price !== undefined
                            ? formatOdds(displayOdds?.price)
                            : "—"}
                        </p>
                        {displayOdds?.point !== undefined && (
                          <p className="text-xs text-[#ED723C] font-semibold">
                            {selectedMarket === "totals" ? (displayOdds.point > 0 ? "O" : "U") : ""}{displayOdds.point}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            )}

            {/* Home Team Row(s) */}
            {selectedMarket === "all" ? (
              // Show three rows for all market types
              <>
                {/* Moneyline Row */}
                <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-28 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                      {game.home_team && getTeamLogo(game.home_team) ? (
                        <Image
                          src={getTeamLogo(game.home_team)}
                          alt={game.home_team}
                          width={36}
                          height={36}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="flex flex-col">
                        <p className="text-[10px] sm:text-xs text-white mb-1">
                          {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.home_team}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Moneyline</p>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                      {filteredBookmakers.map((bookmaker) => {
                        const h2hMarket = bookmaker.markets?.find((m: Market) => m.key === "h2h");
                        const h2hOdds = h2hMarket?.outcomes?.find((o: Outcome) => o.name === game.home_team);
                        return (
                          <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                            <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                              {h2hOdds?.price !== null && h2hOdds?.price !== undefined ? formatOdds(h2hOdds?.price) : "—"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Spread Row */}
                <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-28 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                      {game.home_team && getTeamLogo(game.home_team) ? (
                        <Image
                          src={getTeamLogo(game.home_team)}
                          alt={game.home_team}
                          width={36}
                          height={36}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="flex flex-col">
                        <p className="text-[10px] sm:text-xs text-white mb-1">
                          {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.home_team}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Spread</p>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                      {filteredBookmakers.map((bookmaker) => {
                        const spreadMarket = bookmaker.markets?.find((m: Market) => m.key === "spreads");
                        const spreadOdds = spreadMarket?.outcomes?.find((o: Outcome) => o.name === game.home_team);
                        return (
                          <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                            <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                              {spreadOdds?.price !== null && spreadOdds?.price !== undefined ? formatOdds(spreadOdds?.price) : "—"}
                            </p>
                            {spreadOdds?.point !== undefined && (
                              <p className="text-xs text-[#ED723C] font-semibold">{spreadOdds?.point}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Over/Under Row */}
                <div className="border-b border-white/10 hover:bg-white/5 transition-colors px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-28 sm:w-40 md:w-48 shrink-0 flex items-start gap-1.5 sm:gap-2">
                      {game.home_team && getTeamLogo(game.home_team) ? (
                        <Image
                          src={getTeamLogo(game.home_team)}
                          alt={game.home_team}
                          width={36}
                          height={36}
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="flex flex-col">
                        <p className="text-[10px] sm:text-xs text-white mb-1">
                          {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.home_team}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-400">Over/Under</p>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-1.5 sm:gap-3 justify-between">
                      {filteredBookmakers.map((bookmaker) => {
                        const totalMarket = bookmaker.markets?.find((m: Market) => m.key === "totals");
                        const totalUnder = totalMarket?.outcomes?.[1];
                        return (
                          <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                            <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                              {totalUnder?.price !== null && totalUnder?.price !== undefined ? formatOdds(totalUnder?.price) : "—"}
                            </p>
                            {totalUnder?.point !== undefined && (
                              <p className="text-xs text-[#ED723C] font-semibold">
                                {totalUnder.point > 0 ? "O" : "U"}{totalUnder?.point}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Single row for specific market type
              <div className="hover:bg-white/5 transition-colors px-4 sm:px-6 py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Team Info */}
                  <div className="w-28 sm:w-40 md:w-48 shrink-0 flex items-center gap-1.5 sm:gap-2">
                    {game.home_team && getTeamLogo(game.home_team) ? (
                      <Image
                        src={getTeamLogo(game.home_team)}
                        alt={game.home_team}
                        width={36}
                        height={36}
                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 object-contain shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-white mb-1">
                        {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                      </p>
                      <p className="text-[11px] sm:text-xs md:text-sm font-bold text-white truncate">{game.home_team}</p>
                    </div>
                  </div>

                  {/* Odds */}
                  <div className="flex-1 flex gap-2 sm:gap-3 justify-between">
                    {filteredBookmakers.map((bookmaker) => {
                      const spreadMarket = bookmaker.markets?.find((m: Market) => m.key === "spreads");
                      const totalMarket = bookmaker.markets?.find((m: Market) => m.key === "totals");
                      const h2hMarket = bookmaker.markets?.find((m: Market) => m.key === "h2h");

                      const spreadOdds = spreadMarket?.outcomes?.find((o: Outcome) => o.name === game.home_team);
                      const totalUnder = totalMarket?.outcomes?.[1];
                      const h2hOdds = h2hMarket?.outcomes?.find((o: Outcome) => o.name === game.home_team);

                      let displayOdds: { price?: number; point?: number } | undefined;
                      if (selectedMarket === "spreads") {
                        displayOdds = spreadOdds;
                      } else if (selectedMarket === "totals") {
                        displayOdds = totalUnder;
                      } else if (selectedMarket === "h2h") {
                        displayOdds = h2hOdds;
                      }

                      return (
                        <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-1.5 sm:px-2 py-1.5 sm:py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-10 sm:min-h-12">
                          <p className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                            {displayOdds?.price !== null && displayOdds?.price !== undefined
                              ? formatOdds(displayOdds?.price)
                              : "—"}
                          </p>
                          {displayOdds?.point !== undefined && (
                            <p className="text-xs text-[#ED723C] font-semibold">
                              {selectedMarket === "totals" ? (displayOdds.point > 0 ? "O" : "U") : ""}{displayOdds.point}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            </div>
           </div>
          </div>
        </div>

      </div>
    </div>
  );
}
