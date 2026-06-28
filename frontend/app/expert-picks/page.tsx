import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";
import { ExpertPicksSection } from "@/components/landing/sections/ExpertPicksSection";

export const metadata: Metadata = {
  title: "Premium Expert Picks | SmartEdge & Handicappers | SmartEdgePicks",
  description: "Premium sports picks from SmartEdge AI and professional handicappers. Full odds, detailed analysis, and verified track records with a paid membership.",
  alternates: {
    canonical: "https://www.smartedgepicks.com/expert-picks",
  },
};

export default function ExpertPicksPage() {
  return (
    <LandingSubpageLayout>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center py-12 sm:py-24">
            <div className="size-6 sm:size-8 animate-pulse rounded-full bg-white/10" />
          </div>
        }
      >
        <ExpertPicksSection />
      </Suspense>
    </LandingSubpageLayout>
  );
}