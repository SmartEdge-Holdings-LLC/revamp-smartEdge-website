"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function AnimatedSuccessTick({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        className={cn(
          "relative flex size-20 items-center justify-center rounded-2xl",
          "pricing-accent-gradient shadow-[0_8px_32px_rgb(234_105_58/0.4),inset_0_1px_0_rgb(255_255_255/0.3)]",
          "ring-1 ring-white/20",
          className
        )}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="size-9 text-white" fill="none" aria-hidden>
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      className={cn("relative flex size-20 items-center justify-center", className)}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.08 }}
      aria-hidden
    >
      <motion.span
        className="absolute inset-0 rounded-2xl ring-2 ring-accent/45"
        initial={{ scale: 1, opacity: 0.55 }}
        animate={{ scale: 1.45, opacity: 0 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        className="absolute inset-0 rounded-2xl ring-2 ring-accent/25"
        initial={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: 1.25, opacity: 0 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.35 }}
      />

      <motion.div
        className={cn(
          "relative flex size-20 items-center justify-center rounded-2xl",
          "pricing-accent-gradient shadow-[0_8px_32px_rgb(234_105_58/0.4),inset_0_1px_0_rgb(255_255_255/0.3)]",
          "ring-1 ring-white/20"
        )}
        initial={{ rotate: -8 }}
        animate={{ rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.12 }}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-9 text-white"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <motion.path
            d="M5 13l4 4L19 7"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.28, ease: EASE_OUT }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
