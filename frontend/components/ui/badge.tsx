import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
      "bg-white/10 text-slate-100 ring-1 ring-white/15",
      className
    )}
    {...props}
  />
);
