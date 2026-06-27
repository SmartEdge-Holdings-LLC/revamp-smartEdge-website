import type { Metadata } from "next";
import { Suspense } from "react";
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