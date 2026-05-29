"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { TeamLogo } from "@/components/admin/TeamLogo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { LeagueTeam } from "@/types/picks";

const triggerClass =
  "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-white/12 bg-white/5 px-3 py-2 typo-body-sm text-slate-100 shadow-sm outline-none transition-colors hover:border-white/20 focus-visible:border-accent/55 focus-visible:ring-1 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50";

type TeamSelectProps = {
  id?: string;
  value: string;
  onChange: (teamId: string) => void;
  teams: LeagueTeam[];
  placeholder?: string;
  disabled?: boolean;
  excludeTeamId?: string;
  className?: string;
};

export function TeamSelect({
  id,
  value,
  onChange,
  teams,
  placeholder = "Select team",
  disabled,
  excludeTeamId,
  className,
}: TeamSelectProps) {
  const [open, setOpen] = React.useState(false);
  const options = teams.filter((t) => t.id !== excludeTeamId);
  const selected = teams.find((t) => t.id === value);
  const isDisabled = disabled || options.length === 0;

  const pickTeam = (teamId: string) => {
    onChange(teamId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild disabled={isDisabled}>
        <button id={id} type="button" className={cn(triggerClass, className)}>
          <span className="flex min-w-0 flex-1 items-center justify-start gap-2">
            {selected ? (
              <>
                <TeamLogo
                  src={selected.logo}
                  shortName={selected.shortName}
                  size={22}
                  className="shrink-0"
                />
                <span className="truncate font-medium leading-none">{selected.shortName}</span>
              </>
            ) : (
              <span className="truncate text-subtle">{placeholder}</span>
            )}
          </span>
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
        <ul role="listbox" aria-label="Teams" className="flex flex-col gap-0.5">
          {options.map((team) => {
            const isSelected = team.id === value;
            return (
              <li key={team.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center gap-2.5 rounded-md py-2 pr-8 pl-2 text-left text-sm text-slate-200 outline-none",
                    "hover:bg-white/10 focus:bg-white/10 focus:text-white",
                    isSelected && "bg-white/10 text-white"
                  )}
                  onClick={() => pickTeam(team.id)}
                >
                  <TeamLogo
                    src={team.logo}
                    shortName={team.shortName}
                    size={24}
                    className="shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-none">{team.shortName}</span>
                    <span className="block truncate text-[11px] text-subtle">{team.name}</span>
                  </span>
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

export { TeamLogo };
