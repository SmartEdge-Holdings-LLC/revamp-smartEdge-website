import { Brain, ListOrdered, Send, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AccentIconBadge } from "@/components/landing/AccentIconBadge";
import { HOW_IT_WORKS_STEPS } from "@/components/landing/landing-content";
import { HowItWorksStepMockup } from "./HowItWorksStepMockups";

const STEP_ICONS: LucideIcon[] = [Brain, UserCheck, Send];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative z-10 bg-black px-5 py-20 sm:px-6 md:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-xl space-y-5 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300">
            <ListOrdered className="size-3.5 text-accent" strokeWidth={1.75} aria-hidden />
            How it works
          </p>
          <div>
            <h2 className="font-pricing-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.1] tracking-tight text-white">
              How SmartEdge<sup className="text-[0.55em] font-normal">®</sup> Gives You the Edge
            </h2>
            <p className="font-pricing-serif mt-1 text-[clamp(2.25rem,5vw,3.25rem)] italic leading-[1.1] tracking-tight pricing-accent-text">
              A three-step system built on data, expertise, and speed.
            </p>
          </div>
        </div>

        <ol className="mt-14 grid auto-rows-fr gap-6 md:mt-16 md:grid-cols-3 md:gap-6 lg:gap-8">
          {HOW_IT_WORKS_STEPS.map((item, index) => {
            const Icon = STEP_ICONS[index];

            return (
              <li key={item.step} className="flex h-full min-h-0">
                <article className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/3 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.8)]">
                  <HowItWorksStepMockup index={index} />

                  <div className="flex min-h-36 flex-1 gap-4 border-t border-white/10 px-5 py-5 sm:min-h-38 sm:px-6 sm:py-6">
                    <AccentIconBadge icon={Icon} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-accent">
                        Step {item.step}
                      </p>
                      <h3 className="line-clamp-2 min-h-9 text-base font-semibold leading-tight text-white sm:text-[17px]">
                        {item.title}
                      </h3>
                      <p className="line-clamp-2 min-h-9 flex-1 text-sm leading-tight text-subtle">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
