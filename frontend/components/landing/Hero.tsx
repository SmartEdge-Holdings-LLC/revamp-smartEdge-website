import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";
import { SportsSlider } from "@/components/landing/SportsSlider";

export function Hero() {
  return (
    <section className="relative z-10 w-full min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 sm:gap-10 md:gap-12 lg:flex-row lg:items-center lg:gap-16">
        {/* Left — Text & CTA */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left w-full lg:max-w-[55%]">
          <div className="inline-flex items-center rounded-full border border-white/18 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 text-[10px] sm:text-xs md:text-sm font-medium uppercase tracking-[0.14em] text-slate-200/95 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.1)] backdrop-blur-2xl">
            Industry Leading Sports Intelligence
          </div>

          <h1 className="typo-hero-title mt-4 sm:mt-6 md:mt-8 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white">
            Industry Leading Handicappers.
            <br />
            Custom AI Models.
            <br />
            Premium Sports betting Predictions
          </h1>

          <p className="text-pretty mt-3 sm:mt-4 md:mt-5 max-w-2xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed text-subtle sm:leading-relaxed md:leading-relaxed">
            Make sharper bets with model-backed picks, confidence scores, and real-time market insights across NFL,
            NBA, MLB, and more.
          </p>

          <div className="mt-6 sm:mt-8 flex w-full flex-col gap-2.5 sm:gap-3 md:gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
            <PricingAccentButton
              href="/#pricing"
              fullWidth={true}
              className="typo-button-lg w-full cursor-pointer px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-3.5 sm:w-auto text-sm sm:text-base"
            >
              Start Winning Today
            </PricingAccentButton>
            <Link href="#pricing" className="w-full sm:w-auto">
              <Button className="typo-button-lg h-auto w-full min-h-10 sm:min-h-12 md:min-h-14 lg:min-h-15 cursor-pointer items-center rounded-full border-0 bg-linear-to-r from-[#B3B3B3] via-[#F6F6F6] to-[#F6F6F6] px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-3.5 font-semibold tracking-normal text-black transition-opacity duration-300 hover:opacity-90 text-sm sm:text-base">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* Right — Sports logos */}
        <div className="w-full shrink-0 lg:w-[45%] mt-4 sm:mt-6 md:mt-8 lg:mt-0">
          <SportsSlider />
        </div>
      </div>
    </section>
  );
}
