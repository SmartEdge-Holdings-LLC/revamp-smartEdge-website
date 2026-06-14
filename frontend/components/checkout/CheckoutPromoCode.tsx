"use client";

import * as React from "react";
import { Check, Loader2, TicketPercent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AdminPromotion } from "@/types/promotions";

const inputClass =
  "h-10 border-white/12 bg-white/5 typo-body-sm text-slate-100 placeholder:text-subtle focus-visible:border-accent/55 focus-visible:ring-accent/25";

type CheckoutPromoCodeProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  className?: string;
};

export function CheckoutPromoCode({
  value,
  onChange,
  disabled,
  className,
}: CheckoutPromoCodeProps) {
  const [checking, setChecking] = React.useState(false);
  const [valid, setValid] = React.useState<boolean | null>(null);
  const [validLabel, setValidLabel] = React.useState<string | null>(null);
  const [assignedOffers, setAssignedOffers] = React.useState<AdminPromotion[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/stripe/my-promotions", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { promotions?: AdminPromotion[] };
        if (!cancelled && data.promotions?.length) {
          setAssignedOffers(data.promotions);
        }
      } catch {
        /* ignore — user may not be signed in yet */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = React.useCallback(async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setValid(null);
      setValidLabel(null);
      return;
    }
    setChecking(true);
    try {
      const res = await fetch("/api/stripe/validate-promotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = (await res.json()) as {
        valid?: boolean;
        promotion?: AdminPromotion;
        error?: string;
      };
      if (data.valid && data.promotion) {
        setValid(true);
        setValidLabel(`${data.promotion.discount} — ${data.promotion.description}`);
      } else {
        setValid(false);
        setValidLabel(data.error ?? "Invalid code");
      }
    } catch {
      setValid(false);
      setValidLabel("Could not validate code");
    } finally {
      setChecking(false);
    }
  }, []);

  React.useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      setValid(null);
      setValidLabel(null);
      return;
    }
    const id = setTimeout(() => void validate(trimmed), 500);
    return () => clearTimeout(id);
  }, [value, validate]);

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor="checkout-promo"
        className="flex items-center gap-2 typo-caption font-semibold uppercase tracking-[0.12em] text-slate-400"
      >
        <TicketPercent className="size-3.5 text-accent" />
        Promo code (optional)
      </label>
      <div className="relative">
        <Input
          id="checkout-promo"
          className={cn(inputClass, "pr-10 font-mono uppercase")}
          placeholder="ENTER CODE"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          disabled={disabled}
          autoComplete="off"
        />
        {checking && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-subtle" />
        )}
        {!checking && valid === true && (
          <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-400" />
        )}
      </div>
      {validLabel && (
        <p
          className={cn(
            "typo-caption",
            valid === true ? "text-emerald-400" : valid === false ? "text-red-400" : "text-subtle"
          )}
        >
          {validLabel}
        </p>
      )}
      {assignedOffers.length > 0 && (
        <div className="space-y-1.5">
          <p className="typo-caption text-subtle">Your assigned codes:</p>
          <div className="flex flex-wrap gap-2">
            {assignedOffers.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(p.code)}
                className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono typo-caption text-accent hover:bg-accent/20"
              >
                {p.code} · {p.discount}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
