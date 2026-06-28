import { BrandImage } from "@/components/ui/brand-image";
import type { SportHighlight } from "@/components/landing/free-picks-content";
import { cn } from "@/lib/utils";

type SportLeagueHighlightsProps = {
  highlights: SportHighlight[];
  className?: string;
};

export function SportLeagueHighlights({ highlights, className }: SportLeagueHighlightsProps) {
  return (
    <ul
      className={cn(
        "mt-6 flex list-none flex-wrap items-end gap-x-8 gap-y-6 p-0 sm:gap-x-10",
        className
      )}
      aria-label="Sports and leagues covered"
    >
      {highlights.map((item) => (
        <li
          key={item.label}
          className="inline-flex min-w-18 flex-col items-center gap-2.5 text-center"
        >
          <span className="flex size-20 shrink-0 items-center justify-center sm:size-24">
            <BrandImage
              src={item.image}
              alt=""
              width={72}
              height={72}
              className="size-14 object-contain sm:size-16"
              fallback={
                <span className="text-sm font-bold text-accent">{item.label.slice(0, 3)}</span>
              }
            />
          </span>
          <span className="text-sm font-semibold tracking-wide text-[#F8F8F8] sm:text-base">
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
