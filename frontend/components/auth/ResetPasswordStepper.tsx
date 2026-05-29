"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ResetPasswordStep = "email" | "code" | "password";

const STEPS: { id: ResetPasswordStep; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "code", label: "Code" },
  { id: "password", label: "Password" },
];

const CIRCLE_SIZE = "size-9";

type ResetPasswordStepperProps = {
  current: ResetPasswordStep;
};

export function ResetPasswordStepper({ current }: ResetPasswordStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav className="mb-8 w-full" aria-label="Password reset progress">
      <ol className="flex w-full items-start">
        {STEPS.map((item, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;
          const connectorActive = index > 0 && index <= currentIndex;

          return (
            <Fragment key={item.id}>
              {index > 0 ? (
                <li className="flex min-w-[1.5rem] flex-1 list-none self-start" aria-hidden>
                  <div className={cn("flex h-9 w-full items-center px-0.5 sm:px-1")}>
                    <div
                      className={cn(
                        "h-px w-full rounded-full transition-colors duration-500",
                        connectorActive ? "bg-accent/50" : "bg-white/12"
                      )}
                    />
                  </div>
                </li>
              ) : null}

              <li className="flex shrink-0 list-none flex-col items-center">
                <span
                  className={cn(
                    "relative flex items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300",
                    CIRCLE_SIZE,
                    isComplete &&
                      "border-accent/40 bg-accent/15 text-accent shadow-[0_0_24px_-6px_var(--color-accent)]",
                    isCurrent &&
                      "border-accent bg-accent/25 text-white shadow-[0_0_28px_-8px_var(--color-accent)] ring-2 ring-accent/35 ring-offset-2 ring-offset-black/40",
                    isUpcoming && "border-white/10 bg-white/4 text-slate-500"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="size-4 stroke-[2.5]" aria-hidden /> : index + 1}
                </span>

                <span
                  className={cn(
                    "mt-3 whitespace-nowrap text-center text-xs font-medium transition-colors sm:text-[13px]",
                    isCurrent && "text-white",
                    isComplete && "text-slate-400",
                    isUpcoming && "text-slate-600"
                  )}
                >
                  {item.label}
                </span>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
