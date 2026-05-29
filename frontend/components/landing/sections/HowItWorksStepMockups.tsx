"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Brain,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageSquare,
  Plus,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { BrandImage } from "@/components/ui/brand-image";
import { cn } from "@/lib/utils";

/** Official league marks from `public/sports/` */
const DATA_FLOW_LEAGUES = [
  { name: "NFL", image: "/sports/nfl.png" },
  { name: "NBA", image: "/sports/nba.png" },
  { name: "MLB", image: "/sports/mlb.svg" },
] as const;

const DAL_PHI_MOCKUP = {
  away: { logo: "/leagues/nfl/Dallas Cowboys.png", label: "DAL" },
  home: { logo: "/leagues/nfl/Philadelphia Eagl.png", label: "PHI" },
} as const;

const VERIFICATION_FACTORS = [
  "Line movement",
  "Injury reports",
  "Matchup trends",
] as const;

const PROFIT_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/** May 2026 — Friday start (Sun-first week grid) */
const PROFIT_MONTH = {
  label: "May 2026",
  startOffset: 5,
  daysInMonth: 31,
  monthTotal: "+18.5u",
  record: "14–5",
} as const;

const PROFIT_BY_DAY: Partial<
  Record<number, { units: string; result: "win" | "loss" }>
> = {
  1: { units: "+1.2u", result: "win" },
  2: { units: "+2.5u", result: "win" },
  4: { units: "-1u", result: "loss" },
  5: { units: "+3u", result: "win" },
  8: { units: "+1.8u", result: "win" },
  9: { units: "-0.5u", result: "loss" },
  12: { units: "+2u", result: "win" },
  15: { units: "+4.2u", result: "win" },
  16: { units: "+1u", result: "win" },
  19: { units: "-1.5u", result: "loss" },
  22: { units: "+2.8u", result: "win" },
  23: { units: "+1.5u", result: "win" },
  26: { units: "+2u", result: "win" },
  29: { units: "-1u", result: "loss" },
};

function buildProfitCalendarCells() {
  const cells: (number | null)[] = [
    ...Array.from({ length: PROFIT_MONTH.startOffset }, () => null),
    ...Array.from({ length: PROFIT_MONTH.daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const PROFIT_CALENDAR_CELLS = buildProfitCalendarCells();

function ProfitDayCell({ day }: { day: number | null }) {
  if (day === null) {
    return <div className="aspect-square rounded-md" aria-hidden />;
  }

  const entry = PROFIT_BY_DAY[day];

  if (!entry) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-md bg-white/5 text-[9px] font-medium text-zinc-600">
        {day}
      </div>
    );
  }

  const isWin = entry.result === "win";

  return (
    <div
      className={cn(
        "flex aspect-square flex-col items-center justify-center gap-px rounded-md border px-0.5",
        isWin
          ? "border-emerald-500/35 bg-emerald-500/15"
          : "border-red-500/35 bg-red-500/15"
      )}
    >
      <span className="text-[8px] font-medium leading-none text-zinc-500">{day}</span>
      <span
        className={cn(
          "text-[7px] font-bold leading-none",
          isWin ? "text-emerald-400" : "text-red-400"
        )}
      >
        {entry.units}
      </span>
    </div>
  );
}

/** Shared mockup canvas — keeps all step cards the same height */
const MOCKUP_STAGE_HEIGHT = "h-72";
const MOCKUP_INNER_CLASS = "relative mx-auto h-full w-full max-w-[280px]";

function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("absolute inset-0", className)}
      style={{
        backgroundImage:
          "radial-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px), radial-gradient(rgb(234 105 58 / 0.05) 1px, transparent 1px)",
        backgroundSize: "14px 14px, 14px 14px",
        backgroundPosition: "0 0, 7px 7px",
      }}
    />
  );
}

function MockupStage({
  children,
  gradientClassName = "from-accent/10 via-zinc-950 to-black",
}: {
  children: ReactNode;
  gradientClassName?: string;
}) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden", MOCKUP_STAGE_HEIGHT)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradientClassName)} />
      <DotGrid />
      <div className="relative z-10 flex h-full items-center justify-center p-5">{children}</div>
    </div>
  );
}

function GlowPill({
  icon: Icon,
  label,
  className,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-zinc-900/90 py-1 pl-1 pr-3.5 shadow-[0_0_28px_rgba(234,105,58,0.25)] backdrop-blur-sm",
        className
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 p-1 ring-1 ring-accent/25">
        <Icon className="size-3.5 text-accent" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="pr-0.5 text-xs font-medium leading-none text-zinc-200">{label}</span>
    </div>
  );
}

const LEAGUE_BADGE_STYLES: Record<string, string> = {
  NFL: "bg-[#013369] text-white",
  NBA: "bg-[#552583] text-white",
  MLB: "bg-[#002d72] text-white",
};

function LeagueBadge({
  name,
  image,
  className,
}: {
  name: string;
  image: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute flex size-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/90 p-1.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] sm:size-12 sm:p-2",
        className
      )}
    >
      <BrandImage
        src={image}
        alt={name}
        width={40}
        height={40}
        className="size-7 object-contain sm:size-8"
        fallback={
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg text-[10px] font-bold sm:size-10 sm:text-[11px]",
              LEAGUE_BADGE_STYLES[name] ?? "bg-zinc-800 text-zinc-200"
            )}
          >
            {name}
          </span>
        }
      />
    </div>
  );
}

function TeamLogo({ src, label }: { src: string; label: string }) {
  return (
    <BrandImage
      src={src}
      alt=""
      width={28}
      height={28}
      className="size-7 object-contain"
      fallback={
        <span className="text-[10px] font-bold text-zinc-400">{label}</span>
      }
    />
  );
}

/** Step 1 — AI ingests multi-league data */
export function DataAnalysisMockup() {
  return (
    <MockupStage gradientClassName="from-rose-950/20 via-zinc-950 to-black">
      <div className={MOCKUP_INNER_CLASS}>
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full text-white/12"
          viewBox="0 0 260 200"
          fill="none"
        >
          <path d="M130 100 L52 42" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M130 100 L208 42" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M130 100 L52 158" stroke="currentColor" strokeWidth="1" />
          <path d="M130 100 L208 158" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        <LeagueBadge
          name={DATA_FLOW_LEAGUES[0].name}
          image={DATA_FLOW_LEAGUES[0].image}
          className="left-0 top-2 sm:left-1 sm:top-3"
        />
        <LeagueBadge
          name={DATA_FLOW_LEAGUES[1].name}
          image={DATA_FLOW_LEAGUES[1].image}
          className="right-0 top-2 sm:right-1 sm:top-3"
        />
        <LeagueBadge
          name={DATA_FLOW_LEAGUES[2].name}
          image={DATA_FLOW_LEAGUES[2].image}
          className="bottom-2 left-0 sm:bottom-3 sm:left-1"
        />

        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
          <GlowPill icon={Brain} label="Analyzing odds…" />
          <span className="flex items-center gap-1 rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
            <Activity className="size-3 text-accent" aria-hidden />
            8+ sports · live lines
          </span>
        </div>

        <div className="absolute bottom-3 right-0 flex size-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/90 shadow-sm sm:bottom-4 sm:right-1">
          <BarChart3 className="size-4 text-violet-400" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
    </MockupStage>
  );
}

/** Step 2 — handicapper cross-checks AI output */
export function HandicapperVerificationMockup() {
  return (
    <MockupStage gradientClassName="from-rose-950/20 via-zinc-950 to-black">
      <div className={cn(MOCKUP_INNER_CLASS, "flex flex-col justify-center")}>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-center gap-2">
            <TeamLogo src={DAL_PHI_MOCKUP.away.logo} label={DAL_PHI_MOCKUP.away.label} />
            <p className="text-[11px] font-semibold text-white">DAL @ PHI</p>
            <TeamLogo src={DAL_PHI_MOCKUP.home.logo} label={DAL_PHI_MOCKUP.home.label} />
          </div>
          <p className="mt-1.5 text-center text-[10px] text-zinc-500">Spread · 8:20 PM ET</p>
        </div>

        <div className="relative my-4 flex justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-full h-8 w-px -translate-x-1/2 border-l border-dashed border-white/15"
          />
          <GlowPill icon={UserCheck} label="Expert review…" />
        </div>

        <ul className="space-y-2">
          {VERIFICATION_FACTORS.map((factor) => (
            <li
              key={factor}
              className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-2.5 py-2"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white/8 text-zinc-500">
                <Plus className="size-3" strokeWidth={2} aria-hidden />
              </span>
              <span className="text-[11px] font-medium text-zinc-300">{factor}</span>
              <TrendingUp className="ml-auto size-3.5 text-accent" aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </MockupStage>
  );
}

/** Step 3 — picks delivered + profit calendar */
export function PicksDeliveryMockup() {
  return (
    <MockupStage gradientClassName="from-amber-950/25 via-zinc-950 to-black">
      <div className={MOCKUP_INNER_CLASS}>
        <div className="w-full rounded-2xl border border-white/10 bg-zinc-900/60 p-2.5 shadow-[0_10px_32px_-12px_rgba(0,0,0,0.5)]">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <ChevronLeft className="size-3 text-zinc-600" strokeWidth={2} aria-hidden />
              <div className="text-center">
                <p className="text-[10px] font-semibold leading-tight text-white">Picks profit</p>
                <p className="text-[9px] text-zinc-500">{PROFIT_MONTH.label}</p>
              </div>
              <ChevronRight className="size-3 text-zinc-600" strokeWidth={2} aria-hidden />
            </div>
            <div className="text-right">
              <p className="text-[9px] text-zinc-500">{PROFIT_MONTH.record}</p>
              <p className="text-[10px] font-bold text-emerald-400">{PROFIT_MONTH.monthTotal}</p>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {PROFIT_WEEKDAYS.map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="text-center text-[8px] font-medium text-zinc-500"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {PROFIT_CALENDAR_CELLS.map((day, i) => (
              <ProfitDayCell key={i} day={day} />
            ))}
          </div>

          <div className="mt-2 flex items-center justify-center gap-3 border-t border-white/8 pt-2">
            <span className="flex items-center gap-1 text-[8px] text-zinc-500">
              <span className="size-2 rounded-sm bg-emerald-500/40" aria-hidden />
              Win
            </span>
            <span className="flex items-center gap-1 text-[8px] text-zinc-500">
              <span className="size-2 rounded-sm bg-red-500/40" aria-hidden />
              Loss
            </span>
          </div>
        </div>

        <div className="absolute -bottom-1 -right-3 flex max-w-38 items-center gap-2 rounded-2xl border border-white/12 bg-zinc-900/95 px-3 py-2.5 shadow-[0_12px_32px_-8px_rgba(234,105,58,0.35)] sm:-right-4">
          <span className="flex size-8 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/25">
            <Mail className="size-4 text-accent" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-white">Pick delivered</p>
            <p className="flex items-center gap-1 text-[10px] text-zinc-500">
              <MessageSquare className="size-3 shrink-0" aria-hidden />
              Inbox + SMS
            </p>
          </div>
        </div>
      </div>
    </MockupStage>
  );
}

export function HowItWorksStepMockup({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <DataAnalysisMockup />;
    case 1:
      return <HandicapperVerificationMockup />;
    case 2:
      return <PicksDeliveryMockup />;
    default:
      return null;
  }
}
