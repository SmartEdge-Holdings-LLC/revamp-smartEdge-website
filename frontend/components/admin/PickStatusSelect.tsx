"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PICK_STATUS, PICK_STATUS_LABELS, type PickStatus } from "@/types/picks";

const triggerClass =
  "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-white/12 bg-white/5 px-3 py-2 typo-body-sm text-slate-100 shadow-sm outline-none transition-colors hover:border-white/20 focus-visible:border-accent/55 focus-visible:ring-1 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50";

type PickStatusSelectProps = {
  id?: string;
  value: PickStatus;
  onChange: (value: PickStatus) => void;
  className?: string;
  disabled?: boolean;
};

export function PickStatusSelect({
  id,
  value,
  onChange,
  className,
  disabled,
}: PickStatusSelectProps) {
  const [open, setOpen] = React.useState(false);
  const label = PICK_STATUS_LABELS[value];

  const pick = (status: PickStatus) => {
    onChange(status);
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
        className="z-200 w-(--radix-popover-trigger-width) border-white/10 bg-zinc-950/95 p-1 text-slate-100 shadow-2xl backdrop-blur-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ul role="listbox" aria-label="Pick status" className="flex flex-col gap-0.5">
          {PICK_STATUS.map((status) => {
            const isSelected = status === value;
            return (
              <li key={status} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center rounded-md py-2 pr-8 pl-2 text-left text-sm text-slate-200 outline-none",
                    "hover:bg-white/10 focus:bg-white/10 focus:text-white",
                    isSelected && "bg-white/10 text-white"
                  )}
                  onClick={() => pick(status)}
                >
                  <span className="font-medium leading-none">{PICK_STATUS_LABELS[status]}</span>
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
