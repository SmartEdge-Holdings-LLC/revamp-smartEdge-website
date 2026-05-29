"use client";

import { cn } from "@/lib/utils";
import { ODDS_SPORTS, type OddsSport } from "./odds-data";

interface OddsSportSubNavProps {
  sport: OddsSport;
  onSportChange: (sport: OddsSport) => void;
}

export function OddsSportSubNav({ sport, onSportChange }: OddsSportSubNavProps) {
  return (
    <div className="relative w-full">
      {/* Soft separator — fades at edges so it doesn’t cut the glow on the right */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"
      />
      <div
        className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-6 pb-1 pt-0.5"
        role="tablist"
        aria-label="Sport league"
      >
        {ODDS_SPORTS.map((s) => {
          const active = sport === s;
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSportChange(s)}
              className={cn(
                "relative shrink-0 px-4 py-3.5 text-sm font-medium transition-colors sm:px-5 sm:text-[15px] cursor-pointer",
                active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {s}
              {active ? (
                <span
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent sm:inset-x-4"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
