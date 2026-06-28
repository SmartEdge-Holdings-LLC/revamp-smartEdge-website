import type { Metadata } from "next";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";
import { GameDetailsShell } from "@/components/landing/GameDetailsShell";
import { EventOddsContent } from "@/components/landing/EventOddsContent";
import { fetchGameDetailsById } from "@/lib/api/parlayOddsApi";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gameId: string }>;
}): Promise<Metadata> {
  const { gameId } = await params;

  try {
    const game = await fetchGameDetailsById(gameId);
    const formattedTime = formatCommenceTime(game.commence_time);
    const title = `${game.away_team} vs. ${game.home_team} Odds & Betting Predictions - ${formattedTime} ET | SmartEdgePicks`;
    const description = `Live odds and betting predictions for ${game.away_team} vs. ${game.home_team}. Compare spreads, moneylines, and totals across all sportsbooks with expert analysis from SmartEdgePicks.`;

    return {
      title,
      description,
      alternates: {
        canonical: `https://www.smartedgepicks.com/odds/${gameId}`,
      },
    };
  } catch (error) {
    // Fallback metadata if game data fails to load
    return {
      title: "Live Game Odds & Lines | SmartEdgePicks",
      description: "View live odds, spreads, moneylines, and totals for this game with expert picks and analysis from SmartEdgePicks.",
      alternates: {
        canonical: `https://www.smartedgepicks.com/odds/${gameId}`,
      },
    };
  }
}

export default async function GameDetailsPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  return (
    <LandingSubpageLayout>
      <GameDetailsShell gameId={gameId} />
      <EventOddsContent eventId={gameId} />
    </LandingSubpageLayout>
  );
}
