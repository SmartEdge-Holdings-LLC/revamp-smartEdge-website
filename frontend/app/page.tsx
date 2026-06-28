import type { Metadata } from "next";
import { BackgroundPattern } from "@/components/landing/BackgroundPattern";
import { Hero } from "@/components/landing/Hero";
import { LandingBackdrop } from "@/components/landing/LandingBackdrop";
import { Navbar } from "@/components/landing/Navbar";
import { PromoBanner } from "@/components/landing/PromoBanner";
import { PricingSection } from "@/components/landing/PricingSection";
import {
  FaqSection,
  HandicappersSection,
  HowItWorksSection,
  LandingFooter,
  NewsSection,
  SportsCoverageSection,
  StatsBarSection,
  TestimonialsSection,
} from "@/components/landing/sections";

export const metadata: Metadata = {
  title: "Professional Sports Picks & AI-Powered Analysis | SmartEdgePicks",
  description: "Get expert sports picks with AI-backed analysis for NFL, NBA, MLB, NHL, NCAA, UFC, and PGA. Daily free picks and verified track records from professional handicappers.",
  alternates: {
    canonical: "https://www.smartedgepicks.com",
  },
};

export default function HomePage() {
  return (
    <main className="bg-black text-slate-100">
      <div className="relative min-h-screen overflow-hidden">
        <LandingBackdrop />
        <BackgroundPattern />

        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <div className="py-3 sm:py-4" />
          <PromoBanner />
                    <div className="py-3 sm:py-4" />

          <NewsSection />
          <div className="py-3 sm:py-4" />


          <Hero />
          <SportsCoverageSection />
        </div>
      </div>


      <StatsBarSection />
      <HowItWorksSection />
      {/* <HandicappersSection /> */}
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <LandingFooter />
    </main>
  );
}
