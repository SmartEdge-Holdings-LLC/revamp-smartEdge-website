import type { Metadata } from "next";
import { FreePicksSection } from "@/components/landing/sections/FreePicksSection";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";

export const metadata: Metadata = {
  title: "Free Picks | SmartEdgePicks",
  description: "Free active sports picks with analysis, confidence scores, and matchup details.",
};

export default function FreePicksPage() {
  return (
    <LandingSubpageLayout>
      <FreePicksSection standalone />
    </LandingSubpageLayout>
  );
}
