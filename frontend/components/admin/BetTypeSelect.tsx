"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  BET_TYPE_LABELS,
  getBetTypesForLeague,
  type BetType,
  type League,
} from "@/types/picks";

const triggerClass =
  "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-white/12 bg-white/5 px-3 py-2 typo-body-sm text-slate-100 shadow-sm outline-none transition-colors hover:border-white/20 focus-visible:border-accent/55 focus-visible:ring-1 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50";

type BetTypeSelectProps = {
  id?: string;
  league: League;
  value: BetType;
  onChange: (value: BetType) => void;
  className?: string;
  disabled?: boolean;
};

export function BetTypeSelect({
  id,
  league,
  value,
  onChange,
  className,
  disabled,
}: BetTypeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const options = React.useMemo(() => getBetTypesForLeague(league), [league]);
  const label = BET_TYPE_LABELS[value] ?? value;

  const pick = (betType: BetType) => {
    onChange(betType);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild disabled={disabled}>
        <button id={id} type="button" className={cn(triggerClass, className)}>
          <span className="truncate font-medium leading-none">{label}</span>
          <ChevronDown className="size-4 shrink-0 text-subtle opacity-80" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="z-200 w-(--radix-popover-trigger-width) max-h-64 overflow-y-auto border-white/10 bg-zinc-950/95 p-1 text-slate-100 shadow-2xl backdrop-blur-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ul role="listbox" aria-label="Bet type" className="flex flex-col gap-0.5">
          {options.map((bt) => {
            const isSelected = bt === value;
            return (
              <li key={bt} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center rounded-md py-2 pr-8 pl-2 text-left text-sm text-slate-200 outline-none",
                    "hover:bg-white/10 focus:bg-white/10 focus:text-white",
                    isSelected && "bg-white/10 text-white"
                  )}
                  onClick={() => pick(bt)}
                >
                  <span className="font-medium leading-none">{BET_TYPE_LABELS[bt]}</span>
                  {isSelected ? (
                    <Check className="absolute right-2 size-4 text-accent" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
