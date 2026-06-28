import type { Metadata } from "next";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";
import { OddsPageShell } from "@/components/landing/OddsPageShell";

export const metadata: Metadata = {
  title: "Live Odds & Spreads | NFL, NBA, MLB, NHL | SmartEdgePicks",
  description: "Live odds, spreads, moneylines, and totals across all major sports leagues. Compare lines and get expert picks from SmartEdgePicks.",
  alternates: {
    canonical: "https://www.smartedgepicks.com/odds",
  },
};

export default function OddsPage() {
  return (
    <LandingSubpageLayout>
      <OddsPageShell />
    </LandingSubpageLayout>
  );
}
