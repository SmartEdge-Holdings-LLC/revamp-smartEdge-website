import type { Metadata } from "next";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";
import { OddsPageShell } from "@/components/landing/OddsPageShell";

export const metadata: Metadata = {
  title: "Odds | SmartEdgePicks",
  description: "Live spreads, moneylines, and totals across NFL, NBA, MLB, and NHL.",
};

export default function OddsPage() {
  return (
    <LandingSubpageLayout>
      <OddsPageShell />
    </LandingSubpageLayout>
  );
}
