"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLiveOdds, type Game } from "@/lib/hooks/useOdds";
import { Calendar } from "lucide-react";

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

const MLB_TEAM_ABBREVS: Record<string, string> = {
  "Arizona Diamondbacks": "ARI",
  "Atlanta Braves": "ATL",
  "Baltimore Orioles": "BAL",
  "Boston Red Sox": "BOS",
  "Chicago Cubs": "CHC",
  "Chicago White Sox": "CWS",
  "Cincinnati Reds": "CIN",
  "Cleveland Guardians": "CLE",
  "Colorado Rockies": "COL",
  "Detroit Tigers": "DET",
  "Houston Astros": "HOU",
  "Kansas City Royals": "KC",
  "Los Angeles Angels": "LAA",
  "Los Angeles Dodgers": "LAD",
  "Miami Marlins": "MIA",
  "Milwaukee Brewers": "MIL",
  "Minnesota Twins": "MIN",
  "New York Mets": "NYM",
  "New York Yankees": "NYY",
  "Philadelphia Phillies": "PHI",
  "Pittsburgh Pirates": "PIT",
  "San Diego Padres": "SD",
  "San Francisco Giants": "SF",
  "Seattle Mariners": "SEA",
  "St. Louis Cardinals": "STL",
  "Tampa Bay Rays": "TB",
  "Texas Rangers": "TEX",
  "Toronto Blue Jays": "TOR",
  "Washington Nationals": "WSH",
  "Oakland Athletics": "OAK",
};

function getTeamLogo(teamName: string): string {
  const logoFile = MLB_TEAM_LOGOS[teamName];
  if (logoFile) {
    return `/leagues/mlb/${encodeURIComponent(logoFile)}`;
  }
  return "";
}

function getTeamAbbrev(teamName: string): string {
  return MLB_TEAM_ABBREVS[teamName] || teamName.slice(0, 3).toUpperCase();
}

function formatOdds(odds?: number | null): string {
  if (odds == null) return "—";
  return odds > 0 ? `+${odds}` : odds.toString();
}

function formatPoint(point?: number | null, prefix?: string): string {
  if (point == null) return "—";
  const sign = point > 0 ? "+" : "";
  return `${prefix || ""}${sign}${point}`;
}

function formatGameTime(commenceTime: string): string {
  const date = new Date(commenceTime);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  if (isToday) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
}

function OddsCard({ game }: { game: Game }) {
  const awayLogo = getTeamLogo(game.away_team);
  const homeLogo = getTeamLogo(game.home_team);
  const awayAbbrev = getTeamAbbrev(game.away_team);
  const homeAbbrev = getTeamAbbrev(game.home_team);

  const firstBookmaker = game.bookmakers?.[0];
  const h2hMarket = firstBookmaker?.markets?.find((m) => m.key === "h2h");
  const spreadsMarket = firstBookmaker?.markets?.find((m) => m.key === "spreads");
  const totalsMarket = firstBookmaker?.markets?.find((m) => m.key === "totals");

  const awayH2h = h2hMarket?.outcomes?.find((o) => o.name === game.away_team)?.price;
  const homeH2h = h2hMarket?.outcomes?.find((o) => o.name === game.home_team)?.price;

  const awaySpread = spreadsMarket?.outcomes?.find((o) => o.name === game.away_team);
  const homeSpread = spreadsMarket?.outcomes?.find((o) => o.name === game.home_team);

  const overTotal = totalsMarket?.outcomes?.find((o) => o.name === "Over");
  const underTotal = totalsMarket?.outcomes?.find((o) => o.name === "Under");

  return (
    <Link href="/odds" className="shrink-0 w-96 sm:w-120 md:w-140 rounded-2xl border-2 border-green-500 bg-[#e4e4ed] p-2.5 sm:p-4 md:p-5 shadow-sm block hover:shadow-md transition-shadow cursor-pointer">
      {/* Column Headers */}
      <div className="grid grid-cols-[0.8fr_0.6fr_0.6fr_0.5fr] gap-x-1.5 sm:gap-x-3 md:gap-x-4 mb-2 sm:mb-3 px-1">
        <div></div>
        <div className="flex items-center justify-center text-[9px] sm:text-xs md:text-sm font-semibold text-gray-600">
          Spread
        </div>
        <div className="flex items-center justify-center text-[9px] sm:text-xs md:text-sm font-semibold text-gray-600">
          O/U
        </div>
        <div className="flex items-center justify-center text-[9px] sm:text-xs md:text-sm font-semibold text-gray-600">
          ML
        </div>
      </div>

      {/* Grid: team info + odds cells */}
      <div className="grid grid-cols-[0.8fr_0.6fr_0.6fr_0.5fr] gap-x-1.5 sm:gap-x-3 md:gap-x-4 gap-y-1 sm:gap-y-2 md:gap-y-3 items-stretch">
        {/* Away team row */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 min-w-0 self-center">
          {awayLogo && (
            <Image
              src={awayLogo}
              alt={game.away_team}
              width={48}
              height={48}
              className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain shrink-0"
            />
          )}
          <span className="text-[10px] sm:text-sm md:text-base font-semibold text-gray-800 truncate">
            {awayAbbrev}
          </span>
        </div>

        {/* Away spread */}
        <div className="flex flex-col items-center justify-center bg-[#ededf4] rounded px-1.5 sm:px-3 md:px-5 h-11 sm:h-14 md:h-17">
          <span className="text-[8px] sm:text-xs md:text-sm text-gray-500 font-medium leading-tight">
            {formatPoint(awaySpread?.point)}
          </span>
          <span className="text-[9px] sm:text-sm md:text-base font-bold text-[#ea693a] leading-tight">
            {formatOdds(awaySpread?.price)}
          </span>
        </div>

        {/* Away total (Over) */}
        <div className="flex flex-col items-center justify-center bg-[#ededf4] rounded px-1.5 sm:px-3 md:px-5 h-11 sm:h-14 md:h-17">
          <span className="text-[8px] sm:text-xs md:text-sm text-gray-500 font-medium leading-tight">
            O {overTotal?.point ?? "—"}
          </span>
          <span className="text-[9px] sm:text-sm md:text-base font-bold text-[#ea693a] leading-tight">
            {formatOdds(overTotal?.price)}
          </span>
        </div>

        {/* Away moneyline */}
        <div className="flex items-center justify-center bg-[#ededf4] rounded px-1 sm:px-3 md:px-5 h-11 sm:h-14 md:h-17">
          <span className="text-[9px] sm:text-sm md:text-base font-bold text-[#ea693a]">
            {formatOdds(awayH2h)}
          </span>
        </div>

        {/* Home team row */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 min-w-0 self-center">
          {homeLogo && (
            <Image
              src={homeLogo}
              alt={game.home_team}
              width={48}
              height={48}
              className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain shrink-0"
            />
          )}
          <span className="text-[10px] sm:text-sm md:text-base font-semibold text-gray-800 truncate">
            {homeAbbrev}
          </span>
        </div>

        {/* Home spread */}
        <div className="flex flex-col items-center justify-center bg-[#ededf4] rounded px-1.5 sm:px-3 md:px-5 h-11 sm:h-14 md:h-17">
          <span className="text-[8px] sm:text-xs md:text-sm text-gray-500 font-medium leading-tight">
            {formatPoint(homeSpread?.point)}
          </span>
          <span className="text-[9px] sm:text-sm md:text-base font-bold text-[#ea693a] leading-tight">
            {formatOdds(homeSpread?.price)}
          </span>
        </div>

        {/* Home total (Under) */}
        <div className="flex flex-col items-center justify-center bg-[#ededf4] rounded px-1.5 sm:px-3 md:px-5 h-11 sm:h-14 md:h-17">
          <span className="text-[8px] sm:text-xs md:text-sm text-gray-500 font-medium leading-tight">
            U {underTotal?.point ?? "—"}
          </span>
          <span className="text-[9px] sm:text-sm md:text-base font-bold text-[#ea693a] leading-tight">
            {formatOdds(underTotal?.price)}
          </span>
        </div>

        {/* Home moneyline */}
        <div className="flex items-center justify-center bg-[#ededf4] rounded px-1 sm:px-3 md:px-5 h-11 sm:h-14 md:h-17">
          <span className="text-[9px] sm:text-sm md:text-base font-bold text-[#ea693a]">
            {formatOdds(homeH2h)}
          </span>
        </div>
      </div>

      {/* Game time */}
      <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-3 md:mt-4 pt-1.5 sm:pt-3 border-t border-[#d5d5e0] px-1">
        <Calendar className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
        <span className="text-[8px] sm:text-xs md:text-sm text-gray-500 font-medium truncate">
          {formatGameTime(game.commence_time)}
        </span>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-96 sm:w-120 md:w-140 rounded-2xl bg-[#e4e4ed] p-2.5 sm:p-4 md:p-5">
      <div className="grid grid-cols-[0.8fr_0.6fr_0.6fr_0.5fr] gap-x-1.5 sm:gap-x-3 md:gap-x-4 gap-y-1 sm:gap-y-2 md:gap-y-3 items-stretch px-1">
        {[0, 1].map((row) => (
          <div key={row} className="contents">
            <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 self-center">
              <div className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-[#d6d6e2] animate-pulse" />
              <div className="h-2 w-8 sm:w-24 md:w-32 rounded bg-[#d6d6e2] animate-pulse" />
            </div>
            {[0, 1, 2].map((col) => (
              <div
                key={col}
                className="flex flex-col items-center justify-center gap-0.5 sm:gap-1.5 bg-[#ededf4] rounded px-1.5 sm:px-3 md:px-5 h-11 sm:h-14 md:h-17"
              >
                <div className="h-1.5 sm:h-3 w-6 sm:w-10 rounded bg-[#d6d6e2] animate-pulse" />
                <div className="h-2 sm:h-4 w-8 sm:w-12 rounded bg-[#d6d6e2] animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-3 md:mt-4 pt-1.5 sm:pt-3 border-t border-[#d5d5e0] px-1">
        <div className="h-2.5 w-2.5 sm:h-4 sm:w-4 rounded bg-[#d6d6e2] animate-pulse" />
        <div className="h-2 sm:h-3.5 w-20 sm:w-32 rounded bg-[#d6d6e2] animate-pulse" />
      </div>
    </div>
  );
}

export function PromoBanner() {
  const [hasMounted, setHasMounted] = useState(false);
  const { data: games = [], isLoading, isFetching } = useLiveOdds("MLB");

  useEffect(() => {
    if (games.length > 0) setHasMounted(true);
  }, [games]);

  const showSkeleton = !hasMounted && (isLoading || isFetching || games.length === 0);

  if (!showSkeleton && games.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#e4e4ed] overflow-hidden">
      {/* Header bar */}
      <div className="bg-[#d6d6e2] px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-center">
        <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 tracking-wide">
          Today&#39;s Games
        </span>
      </div>

      <div className="py-2 sm:py-3 md:py-4">
      <style>{`
        @keyframes slideMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-content {
          animation: slideMarquee 30s linear infinite;
        }
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
      `}</style>
      {showSkeleton ? (
        <div className="flex gap-2 sm:gap-3 md:gap-4 px-2 sm:px-3 md:px-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="marquee-container overflow-hidden">
          <div className="marquee-content flex gap-2 sm:gap-3 md:gap-4 px-2 sm:px-3 md:px-4">
            {[...games, ...games].map((game, i) => (
              <OddsCard key={`${game.id}-${i}`} game={game} />
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
