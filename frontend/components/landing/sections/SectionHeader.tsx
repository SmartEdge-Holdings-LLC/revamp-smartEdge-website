import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  titleClassName,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  titleClassName?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left"
      )}
    >
      {eyebrow ? (
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-pricing-serif text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.12] tracking-tight text-white",
          eyebrow && "mt-5",
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-lg leading-relaxed text-subtle md:text-xl">{subtitle}</p>
      ) : null}
    </div>
  );
}
