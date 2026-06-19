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
  SportsCoverageSection,
  StatsBarSection,
  TestimonialsSection,
  WhyTrustSection,
} from "@/components/landing/sections";

export default function HomePage() {
  return (
    <main className="bg-black text-slate-100">
      <div className="relative min-h-screen overflow-hidden">
        <LandingBackdrop />
        <BackgroundPattern />

        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <PromoBanner />
          <Hero />
        </div>
      </div>

      <StatsBarSection />
      <HowItWorksSection />
      <SportsCoverageSection />
      {/* <HandicappersSection /> */}
      <TestimonialsSection />
      <WhyTrustSection />
      <PricingSection />
      <FaqSection />
      <LandingFooter />
    </main>
  );
}
