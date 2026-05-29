"use client";

import { MessageSquareQuote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/components/landing/landing-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** Duplicated row for seamless horizontal loop (-50% translate) */
const MARQUEE_TESTIMONIALS = [...TESTIMONIALS, ...TESTIMONIALS];

function memberInitials(name: string) {
  return name
    .replace(/\./g, "")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TestimonialCard({
  quote,
  name,
  detail,
  avatar,
}: {
  quote: string;
  name: string;
  detail: string;
  avatar: string;
}) {
  return (
    <blockquote
      className={cn(
        "relative flex w-[min(88vw,20rem)] shrink-0 flex-col rounded-3xl border border-white/10 p-6 sm:w-[20rem]",
        "bg-linear-to-b from-white/4 to-white/2 shadow-[0_16px_48px_-20px_rgba(0,0,0,0.85)]",
        "transition-colors duration-300 hover:border-accent/30 hover:from-white/8"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-accent/45 to-transparent"
      />

      <div className="flex items-center justify-between gap-3">
        <MessageSquareQuote className="size-8 text-accent/70" strokeWidth={1.25} aria-hidden />
        <div className="flex gap-0.5" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-accent/80 text-accent" strokeWidth={0} />
          ))}
        </div>
      </div>

      <p className="mt-4 flex-1 text-[15px] leading-relaxed text-zinc-200">
        &ldquo;{quote}&rdquo;
      </p>

      <footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
        <Avatar className="size-11 shrink-0 ring-2 ring-black ring-offset-0">
          <AvatarImage
            src={avatar}
            alt=""
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="bg-accent/15 text-sm font-bold text-accent">
            {memberInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <cite className="not-italic text-sm font-semibold text-white">{name}</cite>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{detail}</p>
        </div>
      </footer>
    </blockquote>
  );
}

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative z-10 overflow-hidden border-t border-white/10 bg-black py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <div className="mx-auto max-w-xl space-y-5 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300">
            <MessageSquareQuote className="size-3.5 text-accent" strokeWidth={1.75} aria-hidden />
            Member stories
          </p>
          <div>
            <h2 className="font-pricing-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.1] tracking-tight text-white">
              The Numbers Speak for Themselves
            </h2>
            <p className="font-pricing-serif mt-1 text-[clamp(2.25rem,5vw,3.25rem)] italic leading-[1.1] tracking-tight pricing-accent-text">
              What members say after joining SmartEdge<sup className="text-[0.55em] font-normal">®</sup>
            </p>
          </div>
        </div>
      </div>

      {/* Centered horizontal slider */}
      <div
        className="relative mx-auto mt-14 w-full max-w-[90rem] overflow-hidden px-5 sm:px-6 md:mt-16"
        aria-label="Member testimonials"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-black via-black/80 to-transparent sm:left-6 sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-black via-black/80 to-transparent sm:right-6 sm:w-16" />

        <div className="overflow-hidden mask-[linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="testimonials-marquee-track py-1">
            {MARQUEE_TESTIMONIALS.map((item, index) => (
              <TestimonialCard
                key={`${item.name}-${index}`}
                quote={item.quote}
                name={item.name}
                detail={item.detail}
                avatar={item.avatar}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
