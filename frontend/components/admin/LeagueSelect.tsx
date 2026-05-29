"use client";

import { LayoutGrid } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandImage } from "@/components/ui/brand-image";
import { cn } from "@/lib/utils";
import { getPickLeagueLogo, PICK_LEAGUES } from "@/lib/sports-leagues";
import { LEAGUES, type League } from "@/types/picks";

const DEFAULT_LEAGUE: League = "NBA";

function isPickLeague(value: string | undefined): value is League {
  return typeof value === "string" && (PICK_LEAGUES as readonly string[]).includes(value);
}

function LeagueLogo({
  league,
  size = 24,
  className,
}: {
  league: string | undefined;
  size?: number;
  className?: string;
}) {
  const label = isPickLeague(league) ? league : DEFAULT_LEAGUE;
  const src = getPickLeagueLogo(label);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-transparent",
        className
      )}
      style={{ width: size, height: size }}
    >
      <BrandImage
        src={src}
        alt={label}
        width={size}
        height={size}
        className="size-full object-contain object-center"
        fallback={
          <span className="text-[10px] font-bold leading-none text-subtle">{label}</span>
        }
      />
    </span>
  );
}

type LeagueSelectProps = {
  value: League;
  onChange: (league: League) => void;
  id?: string;
  className?: string;
};

export function LeagueSelect({ value, onChange, id, className }: LeagueSelectProps) {
  const safeValue = isPickLeague(value) ? value : DEFAULT_LEAGUE;

  return (
    <Select
      value={safeValue}
      onValueChange={(v) => {
        if (isPickLeague(v)) onChange(v);
      }}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue className="sr-only" />
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2.5">
          <LeagueLogo league={safeValue} size={26} className="shrink-0" />
          <span className="truncate font-medium leading-none">{safeValue}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {LEAGUES.map((lg) => (
          <SelectItem key={lg} value={lg} className="justify-start gap-2.5">
            <LeagueLogo league={lg} size={28} className="shrink-0" />
            <span className="font-medium leading-none">{lg}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type LeagueFilterSelectProps = {
  value: League | "all";
  onChange: (value: League | "all") => void;
  className?: string;
};

export function LeagueFilterSelect({ value, onChange, className }: LeagueFilterSelectProps) {
  const label = value === "all" ? "All leagues" : value;
  const safeValue = value === "all" || isPickLeague(value) ? value : "all";

  return (
    <Select
      value={safeValue}
      onValueChange={(v) => {
        if (v === "all" || isPickLeague(v)) onChange(v);
      }}
    >
      <SelectTrigger aria-label="Filter by league" className={cn("w-auto min-w-42", className)}>
        <SelectValue className="sr-only" />
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2.5">
          {safeValue === "all" ? (
            <span className="flex size-[26px] shrink-0 items-center justify-center bg-transparent text-subtle">
              <LayoutGrid className="size-4" />
            </span>
          ) : (
            <LeagueLogo league={safeValue} size={26} className="shrink-0" />
          )}
          <span className="truncate font-medium leading-none">{label}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="justify-start gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center bg-transparent text-subtle">
            <LayoutGrid className="size-4" />
          </span>
          <span className="font-medium leading-none">All leagues</span>
        </SelectItem>
        {LEAGUES.map((lg) => (
          <SelectItem key={lg} value={lg} className="justify-start gap-2.5">
            <LeagueLogo league={lg} size={28} className="shrink-0" />
            <span className="font-medium leading-none">{lg}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { LeagueLogo };
