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
              "relative -mb-px cursor-pointer pb-3 text-sm transition-colors",
              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
            {isActive ? (
              <span className="absolute inset-x-0 bottom-0 h-px bg-white" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
