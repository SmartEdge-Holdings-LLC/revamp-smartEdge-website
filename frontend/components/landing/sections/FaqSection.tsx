"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LANDING_FAQ } from "@/components/landing/landing-content";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative z-10 bg-black px-4 py-12 sm:px-5 sm:py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs sm:px-3.5 sm:py-1.5 sm:text-[13px] text-zinc-300">
            FAQ
          </p>
          <h2 className="font-pricing-serif mt-3 sm:mt-5 text-lg sm:text-xl md:text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.12] tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {LANDING_FAQ.map((item, index) => {
            const open = openIndex === index;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span className="text-[15px] font-semibold text-white md:text-base">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-accent transition-transform duration-200",
                      open && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
                <div
                  className={cn(
                    "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="min-h-0">
                    <p
                      className={cn(
                        "text-[15px] leading-relaxed text-subtle transition-[padding,opacity] duration-200",
                        open ? "pb-5 opacity-100" : "pb-0 opacity-0"
                      )}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
