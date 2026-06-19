import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";
import { GameDetailsShell } from "@/components/landing/GameDetailsShell";

export const metadata = {
  title: "Game Details | SmartEdgePicks",
  description: "Live odds for MLB games across all sportsbooks",
};

export default async function GameDetailsPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  return (
    <LandingSubpageLayout>
      <GameDetailsShell gameId={gameId} />
    </LandingSubpageLayout>
  );
}
