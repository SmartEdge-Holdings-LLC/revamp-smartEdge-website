import type { LucideIcon } from "lucide-react";
import { Award, BarChart3, ShieldCheck, Sparkles, Users } from "lucide-react";
import { WHY_TRUST_CARDS } from "@/components/landing/landing-content";
import { cn } from "@/lib/utils";

const ICONS = {
  experience: Award,
  /** Clear “AI” read — gradient stroke on Brain/BrainCircuit often renders poorly */
  ai: Sparkles,
  chart: BarChart3,
  users: Users,
} as const;

function TrustIconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div
      className={cn(
        "pricing-accent-gradient flex size-12 shrink-0 items-center justify-center rounded-xl",
        "shadow-[0_4px_20px_rgb(234_105_58/0.35),inset_0_1px_0_rgb(255_255_255/0.25)]"
      )}
    >
      <Icon className="size-6 text-white" strokeWidth={2} aria-hidden />
    </div>
  );
}

export function WhyTrustSection() {
  return (
    <section
      id="why-trust"
      className="relative z-10 border-t border-white/10 bg-black px-4 py-12 sm:px-5 sm:py-20 md:px-6 md:py-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-xl space-y-3 sm:space-y-5 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs sm:px-3.5 sm:py-1.5 sm:text-[13px] text-zinc-300">
            <ShieldCheck className="size-3 sm:size-3.5 text-accent" strokeWidth={1.75} aria-hidden />
            Why trust us
          </p>
          <div>
            <h2 className="font-pricing-serif text-xl sm:text-2xl md:text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.1] tracking-tight text-white">
              The Minds Behind the Machine
            </h2>
            <p className="font-pricing-serif mt-1 text-xl sm:text-2xl md:text-[clamp(2.25rem,5vw,3.25rem)] italic leading-[1.1] tracking-tight pricing-accent-text">
              They helped build SmartEdge<sup className="text-[0.55em] font-normal">®</sup> — not just use it.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-14 grid gap-3 sm:gap-4 sm:grid-cols-2 md:mt-16 md:gap-5">
          {WHY_TRUST_CARDS.map((card) => {
            const Icon = ICONS[card.icon];
            return (
              <article
                key={card.title}
                className={cn(
                  "relative flex h-full min-h-44 flex-col overflow-hidden rounded-3xl p-6 text-left sm:min-h-48 sm:p-7",
                  "border border-white/8 bg-zinc-950/55 shadow-[0_12px_40px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.04)]",
                  "backdrop-blur-2xl",
                  "transition-[background-color,border-color,box-shadow] duration-300",
                  "hover:border-white/12 hover:bg-zinc-900/65 hover:shadow-[0_16px_48px_rgb(0_0_0/0.65),inset_0_1px_0_rgb(255_255_255/0.06)]"
                )}
              >
                <TrustIconBadge icon={Icon} />
                <h3 className="mt-5 text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-subtle">{card.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
