import type { LucideIcon } from "lucide-react";
import { Activity, Award, BarChart3, UserCheck, Users } from "lucide-react";
import { AccentIconBadge } from "@/components/landing/AccentIconBadge";
import { LANDING_STATS } from "@/components/landing/landing-content";
import { cn } from "@/lib/utils";

const STAT_ICON_BY_LABEL: Record<(typeof LANDING_STATS)[number]["label"], LucideIcon> = {
  "Active Members": Users,
  "Sports Covered Daily": Activity,
  "Years of Documented Picks": Award,
  "Expert Handicappers": UserCheck,
};

function StatCard({ stat }: { stat: (typeof LANDING_STATS)[number] }) {
  const Icon = STAT_ICON_BY_LABEL[stat.label];

  return (
    <li className="relative list-none">
      <article
        className={cn(
          "relative flex h-full min-h-44 flex-col overflow-hidden rounded-3xl p-6 text-left sm:min-h-48 sm:p-7",
          "border border-white/8 bg-zinc-950/55 shadow-[0_12px_40px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.04)]",
          "backdrop-blur-2xl",
          "transition-[background-color,border-color,box-shadow] duration-300",
          "hover:border-white/12 hover:bg-zinc-900/65 hover:shadow-[0_16px_48px_rgb(0_0_0/0.65),inset_0_1px_0_rgb(255_255_255/0.06)]"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 -top-12 size-40 rounded-full bg-accent/12 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/6 via-transparent to-black/30"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"
        />

        <div className="relative z-10">
          <AccentIconBadge icon={Icon} />
          <p className="mt-6 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {stat.value}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">{stat.label}</p>
        </div>
      </article>
    </li>
  );
}

export function StatsBarSection() {
  return (
    <section
      aria-label="Platform statistics"
      className="relative z-10 border-y border-white/8 bg-black"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-5 sm:py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-xl space-y-3 sm:space-y-5 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs sm:px-3.5 sm:py-1.5 sm:text-[13px] text-zinc-300">
            <BarChart3 className="size-3 sm:size-3.5 text-accent" strokeWidth={1.75} aria-hidden />
            Platform highlights
          </p>
          <div>
            <h2 className="font-pricing-serif text-xl sm:text-2xl md:text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.1] tracking-tight text-white">
              By the Numbers
            </h2>
            <p className="font-pricing-serif mt-1 text-xl sm:text-2xl md:text-[clamp(2.25rem,5vw,3.25rem)] italic leading-[1.1] tracking-tight pricing-accent-text">
              Trusted by bettors nationwide.
            </p>
          </div>
        </div>

        <ul className="mt-8 sm:mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:mt-14 lg:grid-cols-4 lg:gap-6">
          {LANDING_STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </ul>
      </div>
    </section>
  );
}
