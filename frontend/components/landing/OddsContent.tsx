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

interface OddsContentProps {
  sport: OddsSport;
  onSportChange: (sport: OddsSport) => void;
}

function OddsTable({ games, sport }: { games: Game[]; sport: OddsSport }) {
  // Extract unique sportsbooks
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

  function formatOdds(price: number | null): string {
    if (price === null) return "—";
    return price > 0 ? `+${price}` : String(price);
  }

  return (
    <div className="w-full bg-black/30 overflow-hidden rounded-2xl border-5 border-[#FBFBFB] shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#ED723C] border-b-5 border-[#FBFBFB]">
              <th className="sticky left-0 z-10 bg-[#ED723C] px-8 py-5 text-left font-semibold text-sm text-white uppercase tracking-wide">
                Games
              </th>
              {sportsbooks.map(([key, title]) => (
                <th
                  key={key}
                  className="min-w-40 px-6 py-5 text-center font-semibold text-sm text-white uppercase tracking-wide border-l-5 border-[#FBFBFB]"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-5 divide-[#FBFBFB]">
            {games.map((game) => {
              const detailLink = `/odds/${game.id}`;

              return (
                <tr
                  key={game.id}
                  className="transition-colors hover:bg-white/5 cursor-pointer group"
                >
                  <td className="sticky left-0 z-10 bg-black group-hover:bg-black/90 px-8 py-5 border-r-5 border-[#FBFBFB]">
                    <Link href={detailLink} onClick={() => handleGameClick(game)} className="block">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-400 font-medium">
                          {formatCommenceTime(game.commence_time)}
                        </div>
                        {game.is_live && (
                          <div className="inline-flex text-[11px] font-bold text-white bg-red-500/80 px-2.5 py-1 rounded-full">
                            🔴 LIVE
                          </div>
                        )}
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          {getTeamLogo(game.away_team) && (
                            <Image
                              src={getTeamLogo(game.away_team)}
                              alt={game.away_team}
                              width={24}
                              height={24}
                              className="h-6 w-6 object-contain shrink-0"
                            />
                          )}
                          <div className="text-sm font-semibold text-white truncate">
                            {game.away_team}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getTeamLogo(game.home_team) && (
                            <Image
                              src={getTeamLogo(game.home_team)}
                              alt={game.home_team}
                              width={24}
                              height={24}
                              className="h-6 w-6 object-contain shrink-0"
                            />
                          )}
                          <div className="text-sm font-semibold text-white truncate">
                            {game.home_team}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </td>

                {sportsbooks.map(([bookmakerId]) => {
                  const bookmaker = game.bookmakers.find((b) => b.key === bookmakerId);
                  const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === "h2h");
                  const awayOdds = h2hMarket?.outcomes?.find((o: any) => o.name === game.away_team)?.price || null;
                  const homeOdds = h2hMarket?.outcomes?.find((o: any) => o.name === game.home_team)?.price || null;

                  return (
                    <td
                      key={bookmakerId}
                      className="min-w-40 px-6 py-5 text-center border-l-5 border-[#FBFBFB] bg-black/20 group-hover:bg-white/3 transition-colors"
                    >
                      {bookmaker && h2hMarket ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="text-xs text-slate-400 font-medium">{game.away_team}</div>
                            <div className="text-base font-bold text-white px-3 py-2 rounded-lg bg-black/40 group-hover:bg-white/10 transition-colors">
                              {formatOdds(awayOdds)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-xs text-slate-400 font-medium">{game.home_team}</div>
                            <div className="text-base font-bold text-white px-3 py-2 rounded-lg bg-black/40 group-hover:bg-white/10 transition-colors">
                              {formatOdds(homeOdds)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-sm font-medium py-2">No odds</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoricalOddsTable({ games }: { games: HistoricalGame[] }) {
  // Extract unique sportsbooks
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

  function formatOdds(price: number | null): string {
    if (price === null) return "—";
    return price > 0 ? `+${price}` : String(price);
  }

  return (
    <div className="w-full bg-black/30 overflow-hidden rounded-2xl border-5 border-[#FBFBFB] shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#ED723C] border-b-5 border-[#FBFBFB]">
              <th className="sticky left-0 z-10 bg-[#ED723C] px-8 py-5 text-left font-semibold text-sm text-white uppercase tracking-wide">
                Games
              </th>
              {sportsbooks.map(([key, title]) => (
                <th
                  key={key}
                  className="min-w-40 px-6 py-5 text-center font-semibold text-sm text-white uppercase tracking-wide border-l-5 border-[#FBFBFB]"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-5 divide-[#FBFBFB]">
            {games.map((game) => {
              const detailLink = `/odds/${game.id}`;

              return (
                <tr
                  key={game.id}
                  className="transition-colors hover:bg-white/5 cursor-pointer group"
                >
                  <td className="sticky left-0 z-10 bg-black group-hover:bg-black/90 px-8 py-5 border-r-5 border-[#FBFBFB]">
                    <Link href={detailLink} onClick={() => handleGameClick(game)} className="block">
                      <div className="space-y-3">
                        <div className="text-xs text-slate-400 font-medium">
                          {formatCommenceTime(game.commence_time)}
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            {getTeamLogo(game.away_team) && (
                              <Image
                                src={getTeamLogo(game.away_team)}
                                alt={game.away_team}
                                width={24}
                                height={24}
                                className="h-6 w-6 object-contain shrink-0"
                              />
                            )}
                            <div className="text-sm font-semibold text-white truncate">
                              {game.away_team}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getTeamLogo(game.home_team) && (
                              <Image
                                src={getTeamLogo(game.home_team)}
                                alt={game.home_team}
                                width={24}
                                height={24}
                                className="h-6 w-6 object-contain shrink-0"
                              />
                            )}
                            <div className="text-sm font-semibold text-white truncate">
                              {game.home_team}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </td>

                  {sportsbooks.map(([bookmakerId]) => {
                    const bookmaker = game.bookmakers.find((b) => b.key === bookmakerId);
                    const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === "h2h");
                    const awayOdds = h2hMarket?.outcomes?.find((o: any) => o.name === game.away_team)?.price || null;
                    const homeOdds = h2hMarket?.outcomes?.find((o: any) => o.name === game.home_team)?.price || null;

                    return (
                      <td
                        key={bookmakerId}
                        className="min-w-40 px-6 py-5 text-center border-l-5 border-[#FBFBFB] bg-black/20 group-hover:bg-white/3 transition-colors"
                      >
                        {bookmaker && h2hMarket ? (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="text-xs text-slate-400 font-medium">{game.away_team}</div>
                              <div className="text-base font-bold text-white px-3 py-2 rounded-lg bg-black/40 group-hover:bg-white/10 transition-colors">
                                {formatOdds(awayOdds)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-xs text-slate-400 font-medium">{game.home_team}</div>
                              <div className="text-base font-bold text-white px-3 py-2 rounded-lg bg-black/40 group-hover:bg-white/10 transition-colors">
                                {formatOdds(homeOdds)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-500 text-sm font-medium py-2">No odds</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OddsTableSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border-5 border-[#FBFBFB] shadow-2xl bg-black/30">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#ED723C] border-b-5 border-[#FBFBFB]">
              <th className="sticky left-0 z-10 bg-[#ED723C] px-8 py-5 text-left font-semibold text-sm text-white uppercase tracking-wide">
                <Skeleton className="h-4 w-16 bg-white/20" />
              </th>
              {Array.from({ length: 5 }).map((_, i) => (
                <th
                  key={i}
                  className="min-w-40 px-6 py-5 text-center font-semibold text-sm text-white uppercase tracking-wide border-l-5 border-[#FBFBFB]"
                >
                  <Skeleton className="h-4 w-20 mx-auto bg-white/20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-5 divide-[#FBFBFB]">
            {Array.from({ length: 6 }).map((_, idx) => (
              <tr key={idx} className="bg-black/60 hover:bg-black/80 group">
                <td className="sticky left-0 z-10 bg-black px-8 py-5 border-r-5 border-[#FBFBFB]">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-24 bg-slate-700" />
                    <Skeleton className="h-3 w-28 bg-slate-700" />
                    <Skeleton className="h-3 w-20 bg-slate-700" />
                  </div>
                </td>
                {Array.from({ length: 5 }).map((_, i) => (
                  <td
                    key={i}
                    className="min-w-40 px-6 py-5 text-center border-l-5 border-[#FBFBFB] bg-black/20 group-hover:bg-white/3 transition-colors"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-12 mx-auto bg-slate-700" />
                      <Skeleton className="h-4 w-16 mx-auto bg-slate-700" />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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

      <div className="mx-auto w-full max-w-7-5xl px-5 pb-24 pt-6 sm:px-6 md:pb-32 md:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300">
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
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setViewMode("live")}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewMode === "live"
                ? "bg-[#ED723C] text-white"
                : "bg-white/10 text-zinc-400 hover:bg-white/20"
            }`}
          >
            Live Odds
          </button>
          <button
            onClick={() => setViewMode("historical")}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
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
            <div className="flex items-center justify-center gap-4">
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
                <div className="absolute top-full mt-2 z-50 bg-black border border-white/20 rounded-lg shadow-xl p-4">
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

        <div className="mt-10 flex items-center justify-center gap-2 text-[13px] text-zinc-500">
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

        <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-4 text-center">
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
