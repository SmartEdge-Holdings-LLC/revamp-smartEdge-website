"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";

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
  const [selectedMarket, setSelectedMarket] = useState<"spreads" | "totals" | "h2h" | "all">("all");
  const [game, setGame] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const gameDataStr = localStorage.getItem("selectedGame");
      if (gameDataStr) {
        try {
          const gameData = JSON.parse(gameDataStr);
          setGame(gameData);
        } catch (error) {
          console.error("Error parsing game data:", error);
        }
      }
      setIsLoading(false);
    }
  }, [gameId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Game data not found</p>
          <Link href="/odds" className="text-accent hover:underline">
            Back to Odds
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-4 sm:px-5 sm:pb-24 sm:pt-6 md:px-6 md:pb-32 md:pt-8">
        {/* Back button */}
        <Link
          href="/odds"
          className="inline-flex items-center gap-2 text-accent hover:opacity-80 mb-6 sm:mb-8 transition-opacity text-sm sm:text-base"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Odds
        </Link>

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8">
          {game.away_team} vs. {game.home_team} Odds & Betting Predictions - {formatCommenceTime(game.commence_time).split(" at ")[0]}
        </h1>

        {/* Game Matchup Card */}
        <div className="bg-[#050505] rounded-lg border-5 border-[#FBFBFB] p-6 sm:p-8 mb-8">
          <div className="text-center mb-6">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              {game.away_team} at {game.home_team}
            </p>
            <p className="text-sm sm:text-base text-zinc-400 mt-2">
              {formatCommenceTime(game.commence_time)} • CINR
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 sm:gap-6 md:gap-8">
            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-none rounded-lg">
                {getTeamLogo(game.away_team) && (
                  <Image
                    src={getTeamLogo(game.away_team)}
                    alt={game.away_team}
                    width={60}
                    height={60}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                  />
                )}
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-sm sm:text-base">{game.away_team}</p>
              </div>
            </div>

            {/* Center Column */}
            <div className="flex flex-col items-center gap-4">
              {/* @ Symbol */}
              <div className="text-3xl sm:text-4xl font-bold text-zinc-400">VS</div>

              
            </div>

            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-none rounded-lg">
                {getTeamLogo(game.home_team) && (
                  <Image
                    src={getTeamLogo(game.home_team)}
                    alt={game.home_team}
                    width={60}
                    height={60}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                  />
                )}
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-sm sm:text-base">{game.home_team}</p>
              </div>
            </div>
          </div>
        </div>

              {/* Market Switcher */}
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => setSelectedMarket("all")}
                  className={`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                    selectedMarket === "all"
                      ? "bg-[#ED723C] text-white border border-[#ED723C]"
                      : "border border-[#FBFBFB] text-zinc-400 hover:text-white hover:border-[#ED723C]"
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setSelectedMarket("spreads")}
                  className={`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                    selectedMarket === "spreads"
                      ? "bg-[#ED723C] text-white border border-[#ED723C]"
                      : "border border-[#FBFBFB] text-zinc-400 hover:text-white hover:border-[#ED723C]"
                  }`}
                >
                  Spread
                </button>
                <button
                  onClick={() => setSelectedMarket("totals")}
                  className={`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                    selectedMarket === "totals"
                      ? "bg-[#ED723C] text-white border border-[#ED723C]"
                      : "border border-[#FBFBFB] text-zinc-400 hover:text-white hover:border-[#ED723C]"
                  }`}
                >
                  Over/Under
                </button>
                <button
                  onClick={() => setSelectedMarket("h2h")}
                  className={`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                    selectedMarket === "h2h"
                      ? "bg-[#ED723C] text-white border border-[#ED723C]"
                      : "border border-[#FBFBFB] text-zinc-400 hover:text-white hover:border-[#ED723C]"
                  }`}
                >
                  Moneyline
                </button>
              </div>

        {/* Scrollable Odds Table */}
        <div className="bg-black/60 rounded-lg border-5 border-[#FBFBFB] overflow-x-auto mb-8 sm:mb-12">
          <table className="w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="border-b-5 border-[#FBFBFB] bg-[#ED723C]">
                <th className="sticky left-0 px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-left font-semibold text-white bg-[#ED723C] border-r-5 border-[#FBFBFB] text-sm sm:text-base">
                  Matchup
                </th>
                {game.bookmakers.map((bookmaker) => (
                  <th
                    key={bookmaker.key}
                    className="min-w-32 sm:min-w-40 md:min-w-48 px-2 sm:px-3 py-3 sm:py-4 text-center font-semibold text-white border-r-5 border-[#FBFBFB] last:border-r-0 text-xs"
                  >
                    {bookmaker.title}
                  </th>
                ))}
              </tr>
              <tr className="border-b-5 border-[#FBFBFB] bg-black/40">
                <th className="sticky left-0 px-4 sm:px-5 md:px-6 py-2 sm:py-3 bg-black/40"></th>
                {game.bookmakers.map((bookmaker) => (
                  <th
                    key={`${bookmaker.key}-markets`}
                    className={`px-2 sm:px-3 py-2 sm:py-3 border-r-5 border-[#FBFBFB] last:border-r-0 text-center ${
                      selectedMarket === "all" ? "min-w-40 sm:min-w-48 md:min-w-56" : "min-w-32 sm:min-w-40 md:min-w-48"
                    }`}
                  >
                    {selectedMarket === "all" ? (
                      <div className="grid grid-cols-3 gap-1 text-xs text-zinc-300 font-medium">
                        <div>Spread</div>
                        <div>Total</div>
                        <div>ML</div>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-300 font-medium">
                        {selectedMarket === "spreads" && "Spread"}
                        {selectedMarket === "totals" && "Total"}
                        {selectedMarket === "h2h" && "Moneyline"}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Away team */}
              <tr className="border-b-5 border-[#FBFBFB] hover:bg-black/80 bg-black/60">
                <td className="sticky left-0 px-4 sm:px-5 md:px-6 py-4 sm:py-6 bg-black hover:bg-black/90 border-r-5 border-[#FBFBFB] z-10">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {getTeamLogo(game.away_team) && (
                      <Image
                        src={getTeamLogo(game.away_team)}
                        alt={game.away_team}
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm sm:text-base truncate">{game.away_team}</p>
                      <p className="text-xs text-zinc-500">0-0</p>
                    </div>
                  </div>
                </td>
                {game.bookmakers.map((bookmaker) => {
                  const spreadMarket = bookmaker.markets?.find((m: Market) => m.key === "spreads");
                  const totalMarket = bookmaker.markets?.find((m: Market) => m.key === "totals");
                  const h2hMarket = bookmaker.markets?.find((m: Market) => m.key === "h2h");

                  const spreadOdds = spreadMarket?.outcomes?.find((o: Outcome) => o.name === game.away_team);
                  const totalOver = totalMarket?.outcomes?.[0];
                  const h2hOdds = h2hMarket?.outcomes?.find((o: Outcome) => o.name === game.away_team);

                  if (selectedMarket === "all") {
                    return (
                      <td
                        key={bookmaker.key}
                        className="min-w-40 sm:min-w-48 md:min-w-56 px-2 sm:px-3 py-2 sm:py-4 border-r-5 border-[#FBFBFB] last:border-r-0"
                      >
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-[#1d1c1c] rounded px-2 py-2 text-center">
                            <p className="text-white font-bold text-sm">{formatOdds(spreadOdds?.price)}</p>
                            <p className="text-xs text-zinc-400">{spreadOdds?.point}</p>
                          </div>
                          <div className="bg-[#1d1c1c] rounded px-2 py-2 text-center">
                            <p className="text-white font-bold text-sm">{formatOdds(totalOver?.price)}</p>
                            <p className="text-xs text-zinc-400">O{totalOver?.point}</p>
                          </div>
                          <div className="bg-[#1d1c1c] rounded px-2 py-2 text-center">
                            <p className="text-white font-bold text-sm">{formatOdds(h2hOdds?.price)}</p>
                          </div>
                        </div>
                      </td>
                    );
                  }

                  let displayOdds: { price?: number; point?: number } | undefined;
                  if (selectedMarket === "spreads") {
                    displayOdds = spreadOdds;
                  } else if (selectedMarket === "totals") {
                    displayOdds = totalOver;
                  } else if (selectedMarket === "h2h") {
                    displayOdds = h2hOdds;
                  }

                  return (
                    <td
                      key={bookmaker.key}
                      className="min-w-24 sm:min-w-28 md:min-w-32 px-1.5 sm:px-2 py-2 sm:py-4 border-r-5 border-[#FBFBFB] last:border-r-0 text-center"
                    >
                      <div className="bg-[#1d1c1c] rounded px-2 py-1.5 sm:py-2">
                        <p className="text-white font-bold text-xs sm:text-sm">
                          {formatOdds(displayOdds?.price)}
                        </p>
                        {displayOdds?.point !== undefined && (
                          <p className="text-xs text-zinc-400">
                            {selectedMarket === "totals" ? (displayOdds.point > 0 ? "O" : "U") : ""}{displayOdds.point}
                          </p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Home team */}
              <tr className="hover:bg-black/80 bg-black/60">
                <td className="sticky left-0 px-4 sm:px-5 md:px-6 py-4 sm:py-6 bg-black hover:bg-black/90 border-r-5 border-[#FBFBFB] z-10">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {getTeamLogo(game.home_team) && (
                      <Image
                        src={getTeamLogo(game.home_team)}
                        alt={game.home_team}
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm sm:text-base truncate">{game.home_team}</p>
                      <p className="text-xs text-zinc-500">0-0</p>
                    </div>
                  </div>
                </td>
                {game.bookmakers.map((bookmaker) => {
                  const spreadMarket = bookmaker.markets?.find((m: Market) => m.key === "spreads");
                  const totalMarket = bookmaker.markets?.find((m: Market) => m.key === "totals");
                  const h2hMarket = bookmaker.markets?.find((m: Market) => m.key === "h2h");

                  const spreadOdds = spreadMarket?.outcomes?.find((o: Outcome) => o.name === game.home_team);
                  const totalUnder = totalMarket?.outcomes?.[1];
                  const h2hOdds = h2hMarket?.outcomes?.find((o: Outcome) => o.name === game.home_team);

                  if (selectedMarket === "all") {
                    return (
                      <td
                        key={bookmaker.key}
                        className="min-w-40 sm:min-w-48 md:min-w-56 px-2 sm:px-3 py-2 sm:py-4 border-r-5 border-[#FBFBFB] last:border-r-0"
                      >
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-[#1d1c1c] rounded px-2 py-2 text-center">
                            <p className="text-white font-bold text-sm">{formatOdds(spreadOdds?.price)}</p>
                            <p className="text-xs text-zinc-400">{spreadOdds?.point}</p>
                          </div>
                          <div className="bg-[#1d1c1c] rounded px-2 py-2 text-center">
                            <p className="text-white font-bold text-sm">{formatOdds(totalUnder?.price)}</p>
                            <p className="text-xs text-zinc-400">U{totalUnder?.point}</p>
                          </div>
                          <div className="bg-[#1d1c1c] rounded px-2 py-2 text-center">
                            <p className="text-white font-bold text-sm">{formatOdds(h2hOdds?.price)}</p>
                          </div>
                        </div>
                      </td>
                    );
                  }

                  let displayOdds: { price?: number; point?: number } | undefined;
                  if (selectedMarket === "spreads") {
                    displayOdds = spreadOdds;
                  } else if (selectedMarket === "totals") {
                    displayOdds = totalUnder;
                  } else if (selectedMarket === "h2h") {
                    displayOdds = h2hOdds;
                  }

                  return (
                    <td
                      key={bookmaker.key}
                      className="min-w-24 sm:min-w-28 md:min-w-32 px-1.5 sm:px-2 py-2 sm:py-4 border-r-5 border-[#FBFBFB] last:border-r-0 text-center"
                    >
                      <div className="bg-[#1d1c1c] rounded px-2 py-1.5 sm:py-2">
                        <p className="text-white font-bold text-xs sm:text-sm">
                          {formatOdds(displayOdds?.price)}
                        </p>
                        {displayOdds?.point !== undefined && (
                          <p className="text-xs text-zinc-400">
                            {selectedMarket === "totals" ? (displayOdds.point > 0 ? "O" : "U") : ""}{displayOdds.point}
                          </p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
          </tbody>
          </table>
        </div>

        {/* Game info */}
        <div className="bg-black/60 rounded-lg border-5 border-[#FBFBFB] p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#ED723C]" />
            <p className="text-white font-bold text-sm sm:text-base">{formatCommenceTime(game.commence_time)}</p>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm">Venue and additional details coming soon</p>
        </div>
      </div>
    </div>
  );
}
