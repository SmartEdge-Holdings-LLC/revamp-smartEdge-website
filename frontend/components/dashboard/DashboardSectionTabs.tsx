"use client";

import { cn } from "@/lib/utils";

export type DashboardTabItem<T extends string> = {
  id: T;
  label: string;
};

type DashboardSectionTabsProps<T extends string> = {
  tabs: DashboardTabItem<T>[];
  active: T;
  onChange: (tab: T) => void;
  ariaLabel: string;
};

export function DashboardSectionTabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
}: DashboardSectionTabsProps<T>) {
  return (
    <nav
      className="mt-4 flex flex-wrap justify-start gap-x-8 gap-y-1 border-b border-white/10"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative cursor-pointer px-4 py-2 text-lg font-semibold transition-colors rounded-t-md",
              isActive
                ? "bg-green-500/20 text-white border-t-4 border-l-4 border-r-4 border-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
