"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PICK_ACCESS_LABELS, type PickAccess } from "@/types/picks";

type PickAccessMultiToggleProps = {
  value: PickAccess[];
  onChange: (values: PickAccess[]) => void;
  allowedAccess?: PickAccess[];
  disabled?: boolean;
};

export function PickAccessMultiToggle({
  value,
  onChange,
  allowedAccess,
  disabled,
}: PickAccessMultiToggleProps) {
  const toggle = (access: PickAccess) => {
    if (value.includes(access)) {
      onChange(value.filter((a) => a !== access));
    } else {
      onChange([...value, access]);
    }
  };

  const options = allowedAccess || [
    "free",
    "smartedgeVIP",
    "smartedgeVIPPremium",
    "jonahvip",
    "jonah-vip-premium",
    "tournament",
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">Pick Access Levels</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((access) => {
          const isSelected = value.includes(access);
          return (
            <button
              key={access}
              type="button"
              disabled={disabled}
              onClick={() => toggle(access)}
              className={cn(
                "relative flex items-center justify-center rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-white/12 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8"
              )}
            >
              {PICK_ACCESS_LABELS[access]}
              {isSelected && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-accent">
                    <svg
                      className="h-3 w-3 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {value.length === 0 && (
        <p className="text-xs text-amber-500/70">⚠️ Select at least one access level</p>
      )}
    </div>
  );
}
