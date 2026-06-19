"use client";

import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Check, Coins, Info, Trophy, X } from "lucide-react";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buildRegisterPlanUrl } from "@/lib/subscription-plan";
import type { StripeBrand } from "@/lib/stripe-product-types";
import type { PlanTierParam } from "@/lib/subscription-plan";
import { cn } from "@/lib/utils";

const HANDICAPPER_FEATURES = [
  "Daily AI-backed sports picks",
  "Confidence scores on every play",
  "NFL, NBA, MLB & major leagues",
  "Email pick alerts",
  "Discord community access",
  "Line movement & market alerts",
  "Featured handicapper picks",
  "VIP channel & priority support",
] as const;

const HANDICAPPER_PLAN_INCLUDED: Record<"weekly" | "standard" | "vip", boolean[]> = {
  weekly: [true, true, true, true, false, false, false, false],
  standard: [true, true, true, true, true, true, false, false],
  vip: HANDICAPPER_FEATURES.map(() => true),
};

const SMARTEDGE_VIP_STANDARD_FEATURES = [
  "Access to your Personal member Dashboard",
  "Access to our Highest ROI Plays of the day (ALL SPORTS)",
  "Standard Insights and Analytics",
  "Discord Access",
  "Standard Push notifications / Pick Alerts",
  "Customer Support",
  "Membership Giveaways!",
] as const;

const SMARTEDGE_VIP_PREMIUM_FEATURES = [
  "Exclusive access to All our Highest ROI Plays of the Day (All Sports)",
  "Exclusive Access to SmartEdge's SharpSignal AI plays of the Day (ALL SPORTS)",
  "Exclusive Access to ALL our Parlays, Player props, and Underdog Plays of the Day (ALL SPORTS)",
  "Exclusive Early Pick Lines / Pick Releases / Notifications / Alerts",
  "Exclusive (Premium) Discord Access",
  "Customer Support",
  "Membership Giveaways!",
] as const;

type PlanKey = keyof typeof HANDICAPPER_PLAN_INCLUDED;

interface PlanConfig {
  key: PlanKey;
  name: string;
  description: string;
  tagline?: string;
  features?: readonly string[];
  price: number;
  compareAtPrice?: number;
  periodLabel: "week" | "month";
  highlight?: string;
  cta: string;
  popular?: boolean;
}

const SMARTEDGE_PLANS: PlanConfig[] = [
  {
    key: "weekly",
    name: "Weekly VIP Standard",
    description: "Standard VIP access billed weekly",
    tagline:
      "Perfect for ALL bettors seeking consistent and long term profitability!",
    features: SMARTEDGE_VIP_STANDARD_FEATURES,
    price: 19.99,
    periodLabel: "week",
    cta: "Select plan",
  },
  {
    key: "standard",
    name: "Monthly VIP Standard",
    description: "Our Standard VIP package for consistent, long-term edge",
    tagline:
      "Perfect for ALL bettors seeking consistent and long term profitability!",
    features: SMARTEDGE_VIP_STANDARD_FEATURES,
    price: 29.99,
    compareAtPrice: 35,
    periodLabel: "month",
    cta: "Select plan",
    popular: true,
  },
  {
    key: "vip",
    name: "Monthly VIP Premium",
    description: "Full suite of exclusive picks, alerts, and premium access",
    tagline:
      "OUR FULL SUITE OF PICKS for serious bettors seeking an elite edge and premium access!",
    features: SMARTEDGE_VIP_PREMIUM_FEATURES,
    price: 75,
    compareAtPrice: 105,
    periodLabel: "month",
    cta: "Select plan",
  },
];

const JONAH_PLANS: PlanConfig[] = [
  {
    key: "weekly",
    name: "Jonah's Weekly",
    description: "A full week of Jonah's top plays across major leagues",
    price: 19.99,
    periodLabel: "week",
    highlight: "7 days of Jonah's picks",
    cta: "Select plan",
  },
  {
    key: "standard",
    name: "Jonah's Monthly Standard",
    description: "Month of Jonah's daily picks — best value for followers",
    price: 29.99,
    compareAtPrice: 35,
    periodLabel: "month",
    highlight: "Full month of daily picks",
    cta: "Select plan",
    popular: true,
  },
  {
    key: "vip",
    name: "Jonah's Monthly VIP",
    description: "Jonah's VIP card plays, breakdowns & priority access",
    price: 75,
    compareAtPrice: 105,
    periodLabel: "month",
    highlight: "VIP picks & exclusive channel",
    cta: "Select plan",
  },
];

const PLAN_VIEW_OPTIONS = [
  { value: "vip", label: "SmartEdge® VIP" },
  { value: "handicappers", label: "Featured Handicappers" },
] as const;

type PlanView = (typeof PLAN_VIEW_OPTIONS)[number]["value"];

const PLANS_BY_VIEW: Record<PlanView, PlanConfig[]> = {
  vip: SMARTEDGE_PLANS,
  handicappers: JONAH_PLANS,
};

const BRAND_BY_VIEW: Record<PlanView, StripeBrand> = {
  vip: "smartedge",
  handicappers: "jonah",
};

function parsePlanViewFromSearch(
  value: string | null
): PlanView | null {
  if (value === "vip" || value === "smartedge") return "vip";
  if (value === "handicappers" || value === "jonah") return "handicappers";
  return null;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const headerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

const cardsContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.22, ease: EASE_OUT },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 36, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.96,
    transition: { duration: 0.28, ease: EASE_OUT },
  },
};

const TRUSTED_AVATARS = [
  {
    src: "/avatars/trusted-google-1.jpg",
    alt: "SmartEdgePicks member",
    initials: "AK",
    fallbackClassName: "bg-gradient-to-br from-amber-700 to-amber-900",
  },
  {
    src: "/avatars/trusted-google-2.jpg",
    alt: "SmartEdgePicks member",
    initials: "JL",
    fallbackClassName: "bg-gradient-to-br from-stone-600 to-stone-800",
  },
  {
    src: "/avatars/trusted-google-3.avif",
    alt: "SmartEdgePicks member",
    initials: "MR",
    fallbackClassName: "bg-gradient-to-br from-orange-800 to-red-900",
  },
] as const;

function formatUsd(amount: number) {
  return amount.toFixed(2);
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] leading-snug">
      <span
        className={cn(
          "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full",
          included
            ? "bg-accent/15 text-accent"
            : "bg-white/5 text-zinc-600"
        )}
      >
        {included ? <Check className="size-3" strokeWidth={2.5} /> : <X className="size-3" strokeWidth={2} />}
      </span>
      <span className={cn("flex-1", included ? "text-zinc-300" : "text-zinc-600")}>{label}</span>
      <Info className="mt-0.5 size-3.5 shrink-0 text-zinc-600" strokeWidth={1.75} />
    </li>
  );
}

function PricingCard({
  plan,
  brand,
  reduceMotion,
}: {
  plan: PlanConfig;
  brand: StripeBrand;
  reduceMotion: boolean;
}) {
  const registerHref = buildRegisterPlanUrl(brand, plan.key as PlanTierParam);
  return (
    <motion.div
      className="relative flex h-full flex-col"
      whileHover={reduceMotion ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      {plan.popular && (
        <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.35, ease: EASE_OUT }}
            className="inline-block whitespace-nowrap rounded-full bg-[#0a0a0a] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100 ring-1 ring-accent/40"
          >
            Most Popular
          </motion.span>
        </div>
      )}

      <motion.article
        layout={!reduceMotion}
        className={cn(
          "relative flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border bg-[#0a0a0a] p-6 pt-8 sm:p-7 sm:pt-9",
          plan.popular
            ? "pricing-card-glow border-accent/45 shadow-[0_0_60px_rgb(234_105_58/0.12)]"
            : "border-white/8"
        )}
      >

        <div className="min-h-17 space-y-1">
          <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-zinc-500">{plan.description}</p>
        </div>

        <div className="mt-6 min-h-21 space-y-1">
          {plan.compareAtPrice != null ? (
            <p className="text-base font-medium text-zinc-500 line-through">
              ${formatUsd(plan.compareAtPrice)}
            </p>
          ) : (
            <p className="text-base font-medium text-transparent" aria-hidden>
              &nbsp;
            </p>
          )}
        <p className="flex items-baseline gap-1">
          <span className="font-pricing-serif text-[52px] leading-none tracking-tight text-white">
            ${formatUsd(plan.price)}
          </span>
          <span className="text-sm text-zinc-500">/ {plan.periodLabel}</span>
        </p>
      </div>

        <div className="mt-6 shrink-0">
          <PricingAccentButton href={registerHref}>{plan.cta}</PricingAccentButton>
        </div>

        {(plan.tagline ?? plan.highlight) && (
          <div className="mt-6 border-b border-white/6 pb-5">
            {plan.tagline ? (
              <p className="text-sm font-medium leading-snug text-zinc-200">{plan.tagline}</p>
            ) : (
              <div className="flex min-h-11 items-center gap-2">
                <Coins className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
                <span className="text-sm font-medium text-zinc-200">{plan.highlight}</span>
              </div>
            )}
          </div>
        )}

        <ul className="mt-5 flex flex-1 flex-col gap-3">
          {plan.features
            ? plan.features.map((feature) => (
                <FeatureRow key={feature} label={feature} included />
              ))
            : HANDICAPPER_FEATURES.map((feature, i) => (
                <FeatureRow
                  key={feature}
                  label={feature}
                  included={HANDICAPPER_PLAN_INCLUDED[plan.key][i]}
                />
              ))}
        </ul>
      </motion.article>
    </motion.div>
  );
}

/** Plan tabs + pricing cards (reused on home `#pricing` and free picks). */
function PricingPlansPanelInner({
  className,
  tabLayoutId = "pricing-plan-tab",
  planView: controlledPlanView,
  showTabs = true,
}: {
  className?: string;
  tabLayoutId?: string;
  /** When set, shows only that plan group (hides tabs if `showTabs` is false). */
  planView?: PlanView;
  showTabs?: boolean;
}) {
  const searchParams = useSearchParams();
  const [internalPlanView, setInternalPlanView] = useState<PlanView>("vip");
  const requestedPlanView = parsePlanViewFromSearch(searchParams.get("pricingTab"));

  useEffect(() => {
    if (controlledPlanView || !requestedPlanView) return;
    setInternalPlanView(requestedPlanView);
  }, [controlledPlanView, requestedPlanView]);

  const planView = controlledPlanView ?? internalPlanView;
  const activePlans = PLANS_BY_VIEW[planView];
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn(className)}>
      {showTabs ? (
        <motion.div
          className="flex justify-center sm:justify-start"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.15 }}
        >
          <div
            className="relative inline-flex w-full max-w-none flex-nowrap overflow-x-auto rounded-full border border-white/10 bg-white/3 p-1 sm:w-auto sm:max-w-2xl sm:overflow-visible"
            role="tablist"
            aria-label="Plan type"
          >
            {PLAN_VIEW_OPTIONS.map((option) => {
              const isActive = planView === option.value;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setInternalPlanView(option.value)}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap rounded-full px-5 py-3.5 text-center text-[13px] font-medium leading-none transition-colors sm:px-8 sm:py-4 sm:text-sm",
                    isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {isActive && !reduceMotion ? (
                    <motion.span
                      layoutId={tabLayoutId}
                      className="absolute inset-0 rounded-full border border-accent/55 bg-white/4 shadow-[0_0_24px_rgb(234_105_58/0.15)]"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  ) : isActive ? (
                    <span className="absolute inset-0 rounded-full border border-accent/55 bg-white/4" />
                  ) : null}
                  <motion.span
                    className="relative z-10 inline-block whitespace-nowrap"
                    animate={reduceMotion ? undefined : { scale: isActive ? 1.02 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {option.value === "vip" ? (
                      <>
                        SmartEdge<sup className="text-[0.55em] font-normal">®</sup> VIP
                      </>
                    ) : (
                      option.label
                    )}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={planView}
          role="tabpanel"
          aria-label={planView === "vip" ? "SmartEdge VIP plans" : "Featured handicapper plans"}
          className={cn(
            "grid items-stretch gap-5 overflow-visible lg:grid-cols-3 lg:gap-4 xl:gap-5",
            showTabs ? "mt-10 pt-2" : "mt-0"
          )}
          variants={reduceMotion ? undefined : cardsContainer}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          exit={reduceMotion ? undefined : "exit"}
        >
          {activePlans.map((plan) => (
            <motion.div
              key={`${tabLayoutId}-${plan.key}`}
              variants={reduceMotion ? undefined : cardItem}
              className="h-full"
            >
              <PricingCard
                plan={plan}
                brand={BRAND_BY_VIEW[planView]}
                reduceMotion={!!reduceMotion}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function PricingPlansPanel(
  props: {
    className?: string;
    tabLayoutId?: string;
    planView?: PlanView;
    showTabs?: boolean;
  }
) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "min-h-[320px] animate-pulse rounded-2xl bg-white/5",
            props.className
          )}
        />
      }
    >
      <PricingPlansPanelInner {...props} />
    </Suspense>
  );
}

export function PricingSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="pricing" className="relative z-10 bg-black px-4 pb-16 pt-6 sm:px-5 sm:pb-24 sm:pt-8 md:px-6 md:pb-32 md:pt-12">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between"
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={{ once: true, margin: "-80px" }}
          variants={reduceMotion ? undefined : headerStagger}
        >
          <div className="max-w-xl space-y-5">
            <motion.div
              variants={reduceMotion ? undefined : fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300"
            >
              <Trophy className="size-3.5 text-accent" strokeWidth={1.75} />
              Pick subscriptions
            </motion.div>
            <motion.div variants={reduceMotion ? undefined : fadeUp}>
              <h2 className="font-pricing-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.1] tracking-tight text-white">
                Pro Pick Plans
              </h2>
              <p className="font-pricing-serif mt-1 text-[clamp(2.25rem,5vw,3.25rem)] italic leading-[1.1] tracking-tight pricing-accent-text">
                Expert picks. Real edge.
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={reduceMotion ? undefined : fadeUp}
            className="flex items-center gap-3 lg:pt-2"
          >
            <div className="flex -space-x-2">
              {TRUSTED_AVATARS.map((avatar) => (
                <Avatar
                  key={avatar.src}
                  className="size-8 border-2 border-black ring-0"
                >
                  <AvatarImage
                    src={avatar.src}
                    alt={avatar.alt}
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback
                    className={cn("text-[10px] font-semibold text-white", avatar.fallbackClassName)}
                  >
                    {avatar.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="text-[13px] text-zinc-500">
              Trusted by <span className="font-medium text-zinc-300">3,000+</span> members
            </p>
          </motion.div>
        </motion.div>

        <PricingPlansPanel className="mt-10" />
      </div>
    </section>
  );
}
