import type { Metadata } from "next";
import { FreePicksSection } from "@/components/landing/sections/FreePicksSection";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";

export const metadata: Metadata = {
  title: "Free Daily Sports Picks | SmartEdgePicks",
  description: "Daily free sports picks with full matchup details, odds, and expert analysis. Sample our AI-backed predictions before upgrading.",
  alternates: {
    canonical: "https://www.smartedgepicks.com/free-picks",
  },
};

export default function FreePicksPage() {
  return (
    <LandingSubpageLayout>
      <FreePicksSection standalone />
    </LandingSubpageLayout>
  );
}
