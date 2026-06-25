import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";
import { SportsSlider } from "@/components/landing/SportsSlider";

export function Hero() {
  return (
    <section className="relative z-10 w-full px-4 pb-12 pt-12 text-slate-100 sm:px-5 sm:pb-16 sm:pt-16 md:px-6 md:pb-24 md:pt-20 lg:pb-28 lg:pt-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
        {/* Left — Text & CTA */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="inline-flex items-center rounded-full border border-white/18 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-200/95 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.1)] backdrop-blur-2xl sm:px-5 sm:py-2.5 sm:text-sm md:text-base">
            AI-Powered Sports Intelligence
          </div>

          <h1 className="typo-hero-title mt-6 text-3xl font-bold leading-tight text-white sm:mt-8 sm:text-4xl md:text-5xl lg:text-6xl">
            AI-Driven Sports Picks &amp; Betting Predictions
          </h1>

          <p className="text-pretty mt-4 max-w-2xl text-sm leading-relaxed text-subtle sm:mt-5 sm:text-base sm:leading-relaxed md:text-lg md:leading-relaxed lg:max-w-xl lg:text-xl">
            Make sharper bets with model-backed picks, confidence scores, and real-time market insights across NFL,
            NBA, MLB, and more.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center md:gap-3.5 lg:justify-start">
            <PricingAccentButton
              href="/#pricing"
              fullWidth={true}
              className="typo-button-lg w-full cursor-pointer px-6 py-3 sm:w-auto sm:px-8 md:px-10"
            >
              Start Winning Today
            </PricingAccentButton>
            <Link href="#pricing" className="w-full sm:w-auto">
              <Button className="typo-button-lg h-auto w-full min-h-12 cursor-pointer items-center rounded-full border-0 bg-linear-to-r from-[#B3B3B3] via-[#F6F6F6] to-[#F6F6F6] px-6 py-3 font-semibold tracking-normal text-black transition-opacity duration-300 hover:opacity-90 sm:min-h-15 sm:px-8 sm:py-3.5 md:px-10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* Right — Sports logos */}
        <div className="w-full shrink-0 lg:w-[45%]">
          <SportsSlider />
        </div>
      </div>
    </section>
  );
}
