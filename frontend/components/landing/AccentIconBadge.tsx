import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccentIconBadge({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center rounded-xl",
        "pricing-accent-gradient shadow-[0_4px_20px_rgb(234_105_58/0.35),inset_0_1px_0_rgb(255_255_255/0.25)]",
        "ring-1 ring-white/10 backdrop-blur-sm",
        className
      )}
    >
      <Icon className="size-5 text-white" strokeWidth={2} aria-hidden />
    </div>
  );
}
