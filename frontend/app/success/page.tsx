"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { mapBackendMemberToSessionUser, type BackendMemberUser } from "@/types/member-session";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, LayoutDashboard, Sparkles, Trophy } from "lucide-react";
import { AnimatedSuccessTick } from "@/components/landing/AnimatedSuccessTick";
import { AuthShell } from "@/components/auth/AuthShell";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";

const REDIRECT_SECONDS = 5;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const contentStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.45 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

const NEXT_STEPS = [
  { icon: LayoutDashboard, label: "Open your member dashboard" },
  { icon: Trophy, label: "Access today's highest-ROI plays" },
  { icon: Sparkles, label: "Get pick alerts and VIP insights" },
] as const;

function SuccessContent() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const reduceMotion = useReducedMotion();

  const isCheckoutReturn = Boolean(sessionId);
  const progress = isCheckoutReturn
    ? ((REDIRECT_SECONDS - secondsLeft) / REDIRECT_SECONDS) * 100
    : 0;

  useEffect(() => {
    if (!isCheckoutReturn || !sessionId) return;

    void (async () => {
      try {
        const syncRes = await fetch("/api/stripe/sync-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ sessionId }),
        });
        const syncData = (await syncRes.json()) as {
          subscription?: Pick<BackendMemberUser, "brandSubscriptions">;
        };

        const token = session?.user?.backendToken;
        if (token) {
          const profileRes = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (profileRes.ok) {
            const { user } = (await profileRes.json()) as { user: BackendMemberUser };
            await updateSession({
              user: mapBackendMemberToSessionUser(user, token),
            });
          } else if (syncRes.ok && session?.user && syncData.subscription?.brandSubscriptions) {
            await updateSession({
              user: {
                ...session.user,
                brandSubscriptions:
                  syncData.subscription.brandSubscriptions ?? session.user.brandSubscriptions,
              },
            });
          }
        }
      } catch {
        /* webhook may still update; ignore network errors */
      }
    })();

    const interval = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    const timer = setTimeout(() => router.push("/dashboard"), REDIRECT_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isCheckoutReturn, sessionId, router]);

  const MotionDiv = motion.div;
  const MotionLi = motion.li;

  return (
    <div className="w-full max-w-[480px]">
      <motion.div
        className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/4 p-8 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.1),0_28px_80px_-24px_rgb(0_0_0/0.9)] backdrop-blur-2xl md:p-10"
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-12 size-40 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col items-center text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <Link href="/" className="mb-8 inline-flex shrink-0">
              <Image
                src="/logo.webp"
                alt="SmartEdgePicks"
                width={200}
                height={52}
                className="h-8 w-auto object-contain opacity-95"
                priority
              />
            </Link>
          </motion.div>

          <AnimatedSuccessTick className="mb-1" />

          <MotionDiv
            className="flex w-full flex-col items-center"
            variants={reduceMotion ? undefined : contentStagger}
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "visible"}
          >
            <motion.p
              variants={fadeUp}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-300"
            >
              {isCheckoutReturn ? "Payment confirmed" : "Welcome"}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-pricing-serif mt-4 text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.12] tracking-tight text-white"
            >
              {isCheckoutReturn ? "You're all set" : "Thanks for visiting"}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-3 max-w-sm text-[15px] leading-relaxed text-zinc-400"
            >
              {isCheckoutReturn ? (
                <>
                  Your SmartEdge<sup className="text-[0.55em]">®</sup> membership is active. We&apos;re unlocking
                  your picks and dashboard now.
                </>
              ) : (
                <>Head to your dashboard to view picks, or explore plans if you haven&apos;t subscribed yet.</>
              )}
            </motion.p>

            {isCheckoutReturn ? (
              <motion.ul variants={fadeUp} className="mt-8 w-full space-y-3 text-left">
                {NEXT_STEPS.map(({ icon: Icon, label }, index) => (
                  <MotionLi
                    key={label}
                    variants={fadeUp}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/25">
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-zinc-200">{label}</span>
                    <motion.span
                      initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                      animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 18,
                        delay: 0.65 + index * 0.1,
                      }}
                      className="ml-auto inline-flex"
                    >
                      <Check className="size-4 shrink-0 text-accent" strokeWidth={2} aria-hidden />
                    </motion.span>
                  </MotionLi>
                ))}
              </motion.ul>
            ) : null}

            {isCheckoutReturn ? (
              <motion.div variants={fadeUp} className="mt-8 w-full space-y-2">
                <div className="flex items-center justify-between text-[12px] text-zinc-500">
                  <span>Redirecting to dashboard</span>
                  <span className="tabular-nums text-zinc-400">
                    {secondsLeft > 0 ? `${secondsLeft}s` : "Now"}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full pricing-accent-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progress)}%` }}
                    transition={{ duration: 0.35, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ) : null}

            <motion.div variants={fadeUp} className="mt-8 w-full space-y-3">
              <PricingAccentButton href="/dashboard" fullWidth className="typo-button-md">
                Go to dashboard
              </PricingAccentButton>
              <Link
                href="/"
                className="group inline-flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-white"
              >
                Back to home
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </motion.div>
          </MotionDiv>
        </div>
      </motion.div>

      <motion.p
        className="mt-6 text-center text-xs leading-relaxed text-zinc-600"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        Questions about your membership?{" "}
        <Link
          href="/contact-us"
          className="text-zinc-400 underline-offset-2 transition hover:text-white hover:underline"
        >
          Contact support
        </Link>
      </motion.p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <div className="flex min-h-[320px] w-full max-w-[480px] items-center justify-center">
            <div className="size-8 animate-pulse rounded-full bg-white/10" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </AuthShell>
  );
}
