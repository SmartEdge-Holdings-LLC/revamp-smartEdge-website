"use client";

import Image from "next/image";
import { useLiveOdds, type Game } from "@/lib/hooks/useOdds";

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


function OddsCard({ game }: { game: Game }) {
  const formatOdds = (odds?: number | null) => {
    if (!odds) return "—";
    return odds > 0 ? `+${odds}` : odds.toString();
  };
  const awayLogo = getTeamLogo(game.away_team);
  const homeLogo = getTeamLogo(game.home_team);

  // Extract odds from first bookmaker's h2h market
  const firstBookmaker = game.bookmakers?.[0];
  const h2hMarket = firstBookmaker?.markets?.find((m: any) => m.key === "h2h");
  const awayOdds = h2hMarket?.outcomes?.find((o: any) => o.name === game.away_team)?.price;
  const homeOdds = h2hMarket?.outcomes?.find((o: any) => o.name === game.home_team)?.price;

  return (
    <div className="flex items-center gap-4 sm:gap-6 md:gap-12 bg-white border-5 border-green-500 rounded-lg sm:rounded-xl px-4 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 shrink-0 min-w-fit hover:shadow-lg transition-shadow">
      {/* Away Team */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
        {awayLogo && (
          <Image
            src={awayLogo}
            alt={game.away_team}
            width={80}
            height={80}
            className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain"
          />
        )}
        <div className="flex flex-col gap-0.5 sm:gap-1 md:gap-1.5">
          <span className="text-xs sm:text-sm md:text-base font-medium text-gray-600 line-clamp-1">{game.away_team}</span>
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{formatOdds(awayOdds)}</span>
        </div>
      </div>

      {/* VS */}
      <span className="text-sm sm:text-base md:text-lg font-light text-gray-300 px-1 sm:px-2 md:px-3">vs</span>

      {/* Home Team */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
        {homeLogo && (
          <Image
            src={homeLogo}
            alt={game.home_team}
            width={80}
            height={80}
            className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain"
          />
        )}
        <div className="flex flex-col gap-0.5 sm:gap-1 md:gap-1.5">
          <span className="text-xs sm:text-sm md:text-base font-medium text-gray-600 line-clamp-1">{game.home_team}</span>
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{formatOdds(homeOdds)}</span>
        </div>
      </div>
    </div>
  );
}

export function PromoBanner() {
  const { data: games = [], isLoading } = useLiveOdds("MLB");

  if (isLoading || games.length === 0) {
    return null;
  }

  return (
    <div className="bg-linear-to-r from-gray-50 to-white border-y border-gray-100 overflow-hidden py-2 sm:py-3">
      <style>{`
        @keyframes slideMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee-content {
          animation: slideMarquee 60s linear infinite;
        }
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-container overflow-hidden">
        <div className="marquee-content flex gap-2 sm:gap-3 px-2 sm:px-4">
          {/* Double the items for seamless loop */}
          {[...games, ...games].map((game, i) => (
            <OddsCard key={`${game.id}-${i}`} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}
