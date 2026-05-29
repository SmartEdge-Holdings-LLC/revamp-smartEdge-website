import type { Metadata } from "next";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";
import { ExpertPicksSection } from "@/components/landing/sections/ExpertPicksSection";

export const metadata: Metadata = {
  title: "Expert Picks | SmartEdgePicks",
  description:
    "Premium picks from SmartEdge and Jonah. Unlock full odds and detailed analysis with a paid plan.",
};

export default function ExpertPicksPage() {
  return (
    <LandingSubpageLayout>
      <ExpertPicksSection />
    </LandingSubpageLayout>
  );
}