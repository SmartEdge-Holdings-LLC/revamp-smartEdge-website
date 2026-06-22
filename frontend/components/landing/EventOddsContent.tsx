"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, TrendingUp, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEventOdds } from "@/lib/hooks/useEventOdds";

interface Outcome {
  name: string;
  price: number;
  point?: number;
  description?: string;
}

interface Market {
  key: string;
  outcomes: Outcome[];
  last_update?: string;
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
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

function getTeamLogo(teamName: string): string {
  const logoFile = MLB_TEAM_LOGOS[teamName];
  if (logoFile) {
    return `/leagues/mlb/${logoFile}`;
  }
  return "";
}

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

const MARKET_TABS = [
  { key: "all", label: "All Lines", icon: "📊" },
  { key: "alternate_spreads", label: "Alt Spreads", icon: "📈" },
  { key: "alternate_totals", label: "Alt Totals", icon: "⬆️⬇️" },
  { key: "team_totals", label: "Team Totals", icon: "🎯" },
  { key: "alternate_team_totals", label: "Alt Team Totals", icon: "🔄" },
];

export function EventOddsContent({ eventId }: { eventId: string }) {
  const [selectedMarket, setSelectedMarket] = useState<"alternate_spreads" | "alternate_totals" | "team_totals" | "alternate_team_totals" | "all">("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: game, isLoading, isPending, error } = useEventOdds(eventId);

  if (isLoading || isPending) {
    return <LoadingSkeleton />;
  }

  if (error || !game || !game.bookmakers) {
    return (
      <div className="mx-auto w-full max-w-8xl px-4 py-12 sm:px-5 md:px-6">
        <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center">
          <p className="text-white text-lg font-semibold">Unable to load event odds</p>
          <p className="text-zinc-400 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  const filteredBookmakers = game.bookmakers.filter(
    (bm) => bm.key !== "betonlineag" && bm.key !== "betrivers"
  );

  if (!filteredBookmakers.length) {
    return null;
  }

  return (
    <div className="relative z-10 px-4 sm:px-5 md:px-6 mb-32">
      <div className="mx-auto w-full max-w-8xl px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6 border border-[#ED723C]/30 rounded-xl">
        {/* View Line Movement Toggle */}
        <div
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1.5">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#ED723C]" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-[#ED723C] transition-colors">
              View More Line Movements
            </h2>
          </div>
          <ChevronDown
            className={`w-5 h-5 sm:w-6 sm:h-6 text-[#ED723C] transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        {isExpanded && (
          <div className="mt-8">
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-zinc-400 text-sm sm:text-base">
                  Real-time odds from major sportsbooks
                </p>
                {/* Filter Dropdown */}
                <Select value={selectedMarket} onValueChange={(value) => setSelectedMarket(value as any)}>
                  <SelectTrigger className="w-full sm:w-64 bg-white/5 border border-white/10 text-white">
                    <SelectValue placeholder={MARKET_TABS.find((tab) => tab.key === selectedMarket)?.label || "Select market"} />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 border border-white/10">
                    {MARKET_TABS.map((tab) => (
                      <SelectItem key={tab.key} value={tab.key} className="text-white hover:bg-white/10">
                        <span className="flex items-center gap-2">
                          <span>{tab.icon}</span>
                          {tab.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tables Container */}
            <div className="space-y-8">
              {(selectedMarket === "all" || selectedMarket === "alternate_spreads") && (
                <OddsTable
                  title="Alternate Spreads"
                  marketKey="alternate_spreads"
                  bookmakers={filteredBookmakers}
                  game={game}
                  type="spreads"
                />
              )}

              {(selectedMarket === "all" || selectedMarket === "alternate_totals") && (
                <OddsTable
                  title="Alternate Totals"
                  marketKey="alternate_totals"
                  bookmakers={filteredBookmakers}
                  game={game}
                  type="totals"
                />
              )}

              {(selectedMarket === "all" || selectedMarket === "team_totals") && (
                <OddsTable
                  title="Team Totals"
                  marketKey="team_totals"
                  bookmakers={filteredBookmakers}
                  game={game}
                  type="team_totals"
                />
              )}

              {(selectedMarket === "all" || selectedMarket === "alternate_team_totals") && (
                <OddsTable
                  title="Alternate Team Totals"
                  marketKey="alternate_team_totals"
                  bookmakers={filteredBookmakers}
                  game={game}
                  type="team_totals"
                />
              )}
            </div>

            {/* Game Info Card */}
            <div className="mt-12 rounded-xl bg-linear-to-br from-[#ED723C]/10 to-transparent border border-[#ED723C]/30 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#ED723C]" />
                <p className="text-white font-bold text-base sm:text-lg">
                  {formatCommenceTime(game.commence_time)}
                </p>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Venue and additional details coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OddsTable({
  title,
  marketKey,
  bookmakers,
  game,
  type,
}: {
  title: string;
  marketKey: string;
  bookmakers: Bookmaker[];
  game: any;
  type: string;
}) {
  return (
    <div className="bg-black/60 rounded-lg overflow-hidden">
      {/* Orange Header */}
      <div className="bg-[#ED723C] px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="w-40 sm:w-48"></div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm sm:text-base">{title}</p>
          </div>
        </div>
      </div>

      {/* Sportsbook Header */}
      <div className="flex px-4 sm:px-6 py-4">
          <div className="w-40 sm:w-48"></div>
          <div className="flex-1 flex gap-2 sm:gap-3 justify-between">
            {bookmakers.map((bookmaker) => {
              const logoUrl = getSportsbookLogo(bookmaker.key);
              return (
                <div key={bookmaker.key} className="flex-1 text-center flex items-center justify-center min-h-12">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={bookmaker.title}
                      width={80}
                      height={40}
                      className="h-8 sm:h-10 w-auto object-contain rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <p className="text-xs font-semibold text-zinc-300 truncate">{bookmaker.title}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      {/* Body */}
      {type === "spreads" && (
        <SpreadsTableBody marketKey={marketKey} bookmakers={bookmakers} game={game} />
      )}
      {type === "totals" && (
        <TotalsTableBody marketKey={marketKey} bookmakers={bookmakers} game={game} />
      )}
      {type === "team_totals" && (
        <TeamTotalsTableBody marketKey={marketKey} bookmakers={bookmakers} game={game} />
      )}
    </div>
  );
}

function SpreadsTableBody({ marketKey, bookmakers, game }: any) {
  const filteredBookmakers: Bookmaker[] = bookmakers.filter((bm: Bookmaker) => bm.key !== "betonlineag" && bm.key !== "betrivers");

  const awayOutcomeMap = new Map<number, Outcome>();
  const homeOutcomeMap = new Map<number, Outcome>();

  filteredBookmakers.forEach((bm: Bookmaker) => {
    const market = bm.markets?.find((m: Market) => m.key === marketKey);
    market?.outcomes?.forEach((o: Outcome) => {
      if (o.name === game.away_team && o.point !== undefined) {
        if (!awayOutcomeMap.has(o.point)) {
          awayOutcomeMap.set(o.point, o);
        }
      }
      if (o.name === game.home_team && o.point !== undefined) {
        if (!homeOutcomeMap.has(o.point)) {
          homeOutcomeMap.set(o.point, o);
        }
      }
    });
  });

  const awayOutcomes = Array.from(awayOutcomeMap.values());
  const homeOutcomes = Array.from(homeOutcomeMap.values());

  return (
    <>
      {awayOutcomes.map((awayOutcome: Outcome, idx: number) => (
        <div key={`spread-${idx}`} className="border-b border-white/10 hover:bg-white/5 transition-colors px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-40 sm:w-48 flex items-start gap-2">
              {game.away_team && getTeamLogo(game.away_team) ? (
                <Image
                  src={getTeamLogo(game.away_team)}
                  alt={game.away_team}
                  width={36}
                  height={36}
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <div className="flex flex-col">
                <p className="text-[10px] sm:text-xs text-white mb-1">
                  {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                </p>
                <p className="text-xs sm:text-sm font-bold text-white">{game.away_team}</p>
                <p className="text-xs text-zinc-400">{awayOutcome.point}</p>
              </div>
            </div>
            <div className="flex-1 flex gap-2 sm:gap-3 justify-between">
              {filteredBookmakers.map((bookmaker: Bookmaker) => {
                const spreadMarket = bookmaker.markets?.find((m: Market) => m.key === marketKey);
                const outcome = spreadMarket?.outcomes.find(
                  (o: Outcome) => o.name === game.away_team && o.point === awayOutcome.point
                );
                return (
                  <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-2 py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-12">
                    <p className="text-sm sm:text-base font-bold text-white leading-tight">
                      {outcome ? formatOdds(outcome.price) : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
      {homeOutcomes.map((homeOutcome: Outcome, idx: number) => (
        <div key={`spread-home-${idx}`} className="border-b border-white/10 hover:bg-white/5 transition-colors px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-40 sm:w-48 flex items-start gap-2">
              {game.home_team && getTeamLogo(game.home_team) ? (
                <Image
                  src={getTeamLogo(game.home_team)}
                  alt={game.home_team}
                  width={36}
                  height={36}
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}
              <div className="flex flex-col">
                <p className="text-[10px] sm:text-xs text-white mb-1">
                  {formatCommenceTime(game.commence_time).split(" at ")[1]} ET
                </p>
                <p className="text-xs sm:text-sm font-bold text-white">{game.home_team}</p>
                <p className="text-xs text-zinc-400">{homeOutcome.point}</p>
              </div>
            </div>
            <div className="flex-1 flex gap-2 sm:gap-3 justify-between">
              {filteredBookmakers.map((bookmaker: Bookmaker) => {
                const spreadMarket = bookmaker.markets?.find((m: Market) => m.key === marketKey);
                const outcome = spreadMarket?.outcomes.find(
                  (o: Outcome) => o.name === game.home_team && o.point === homeOutcome.point
                );
                return (
                  <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-2 py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-12">
                    <p className="text-sm sm:text-base font-bold text-white leading-tight">
                      {outcome ? formatOdds(outcome.price) : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function TotalsTableBody({ marketKey, bookmakers, game }: any) {
  const filteredBookmakers: Bookmaker[] = bookmakers.filter((bm: Bookmaker) => bm.key !== "betonlineag" && bm.key !== "betrivers");
  const uniquePoints = Array.from(
    new Set(
      filteredBookmakers
        .flatMap((bm: Bookmaker) =>
          (bm.markets?.find((m: Market) => m.key === marketKey)?.outcomes as Outcome[])?.map((o: Outcome) => o.point) || []
        )
    )
  ).sort((a, b) => (a || 0) - (b || 0));

  return (
    <>
      {uniquePoints.map((point) => (
        <div key={`total-${point}`} className="border-b border-white/10 hover:bg-white/5 transition-colors px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-40 sm:w-48">
              <p className="font-bold text-white text-xs sm:text-sm">O/U {point}</p>
              <p className="text-xs text-zinc-400">Total Points</p>
            </div>
            <div className="flex-1 flex gap-2 sm:gap-3 justify-between">
              {filteredBookmakers.map((bookmaker: Bookmaker) => {
                const totalMarket = bookmaker.markets?.find((m: Market) => m.key === marketKey);
                const overOutcome = totalMarket?.outcomes.find((o: Outcome) => o.name === "Over" && o.point === point);
                const underOutcome = totalMarket?.outcomes.find((o: Outcome) => o.name === "Under" && o.point === point);
                return (
                  <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-2 py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-12 gap-1">
                    <div className="flex gap-1 w-full">
                      <div className="flex-1 bg-green-500/10 rounded px-1 py-1 border border-green-500/20">
                        <p className="text-green-400 text-xs font-bold">O</p>
                        <p className="text-white font-bold text-xs">{overOutcome ? formatOdds(overOutcome.price) : "—"}</p>
                      </div>
                      <div className="flex-1 bg-red-500/10 rounded px-1 py-1 border border-red-500/20">
                        <p className="text-red-400 text-xs font-bold">U</p>
                        <p className="text-white font-bold text-xs">{underOutcome ? formatOdds(underOutcome.price) : "—"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function TeamTotalsTableBody({ marketKey, bookmakers, game }: any) {
  const filteredBookmakers: Bookmaker[] = bookmakers.filter((bm: Bookmaker) => bm.key !== "betonlineag" && bm.key !== "betrivers");
  const uniqueKeys = Array.from(
    new Set(
      filteredBookmakers
        .flatMap((bm: Bookmaker) =>
          (bm.markets?.find((m: Market) => m.key === marketKey)?.outcomes as Array<Outcome & { description?: string }>)?.map(
            (o: Outcome & { description?: string }) => `${o.description}||${o.point}`
          ) || []
        )
    )
  );

  return (
    <>
      {uniqueKeys.map((key: string) => {
        const [description, pointStr] = key.split("||");
        const point = parseFloat(pointStr);
        const teamName = description === game.away_team ? game.away_team : description === game.home_team ? game.home_team : description;

        return (
          <div key={`team-total-${key}`} className="border-b border-white/10 hover:bg-white/5 transition-colors px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-40 sm:w-48 flex items-start gap-2">
                {teamName && getTeamLogo(teamName) ? (
                  <Image
                    src={getTeamLogo(teamName)}
                    alt={teamName}
                    width={36}
                    height={36}
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="flex flex-col">
                  <p className="font-bold text-white text-xs sm:text-sm">{teamName}</p>
                  <p className="text-xs text-zinc-400">{point}</p>
                </div>
              </div>
              <div className="flex-1 flex gap-2 sm:gap-3 justify-between">
                {filteredBookmakers.map((bookmaker: Bookmaker) => {
                  const totalMarket = bookmaker.markets?.find((m: Market) => m.key === marketKey);
                  const overOutcome = (totalMarket?.outcomes as Array<Outcome & { description?: string }>)?.find(
                    (o: Outcome & { description?: string }) => o.description === description && o.point === point && o.name === "Over"
                  );
                  const underOutcome = (totalMarket?.outcomes as Array<Outcome & { description?: string }>)?.find(
                    (o: Outcome & { description?: string }) => o.description === description && o.point === point && o.name === "Under"
                  );
                  return (
                    <div key={bookmaker.key} className="flex-1 bg-white/8 rounded px-2 py-2 text-center hover:bg-white/12 transition-colors flex flex-col items-center justify-center min-h-12 gap-1">
                      <div className="flex gap-1 w-full">
                        <div className="flex-1 bg-green-500/10 rounded px-1 py-1 border border-green-500/20">
                          <p className="text-green-400 text-xs font-bold">O</p>
                          <p className="text-white font-bold text-xs">{overOutcome ? formatOdds(overOutcome.price) : "—"}</p>
                        </div>
                        <div className="flex-1 bg-red-500/10 rounded px-1 py-1 border border-red-500/20">
                          <p className="text-red-400 text-xs font-bold">U</p>
                          <p className="text-white font-bold text-xs">{underOutcome ? formatOdds(underOutcome.price) : "—"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="relative z-10 px-4 sm:px-5 md:px-6 mb-32">
      <div className="mx-auto w-full max-w-8xl px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6 border border-[#ED723C]/30 rounded-xl">
        {/* Toggle Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10" />
            <Skeleton className="h-7 sm:h-9 w-48 sm:w-72 bg-white/10 rounded-lg" />
          </div>
          <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 bg-white/10 rounded" />
        </div>

        {/* Expanded Content Skeleton */}
        <div className="mt-8">
          {/* Filter Row */}
          <div className="flex items-center justify-between gap-4 mb-12">
            <Skeleton className="h-4 w-48 bg-white/10 rounded" />
            <Skeleton className="h-10 w-48 sm:w-64 bg-white/10 rounded-lg" />
          </div>

          {/* Table Skeletons */}
          <div className="space-y-8">
            {[1, 2].map((tableIdx) => (
              <div key={tableIdx} className="bg-black/60 rounded-lg overflow-hidden">
                {/* Orange Header */}
                <div className="bg-[#ED723C] px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-40 sm:w-48"></div>
                    <Skeleton className="h-4 w-32 bg-white/20 rounded" />
                  </div>
                </div>

                {/* Sportsbook Logos */}
                <div className="flex px-4 sm:px-6 py-4">
                  <div className="w-40 sm:w-48 shrink-0"></div>
                  <div className="flex-1 flex gap-2 sm:gap-3 justify-between">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex-1 flex items-center justify-center min-h-12">
                        <Skeleton className="h-8 sm:h-10 w-16 sm:w-20 bg-white/10 rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Rows */}
                {Array.from({ length: 4 }).map((_, rowIdx) => (
                  <div key={rowIdx} className="border-b border-white/10 px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-40 sm:w-48 flex items-start gap-2">
                        <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 bg-white/10 rounded shrink-0" />
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-2.5 w-14 bg-white/10 rounded" />
                          <Skeleton className="h-3.5 w-28 bg-white/10 rounded" />
                          <Skeleton className="h-2.5 w-10 bg-white/10 rounded" />
                        </div>
                      </div>
                      <div className="flex-1 flex gap-2 sm:gap-3 justify-between">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex-1 bg-white/8 rounded px-2 py-2 flex items-center justify-center min-h-12">
                            <Skeleton className="h-4 w-10 bg-white/10 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Game Info Card Skeleton */}
          <div className="mt-12 rounded-xl bg-[#ED723C]/10 border border-[#ED723C]/30 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 bg-white/10 rounded" />
              <Skeleton className="h-5 w-56 bg-white/10 rounded" />
            </div>
            <Skeleton className="h-3.5 w-64 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
