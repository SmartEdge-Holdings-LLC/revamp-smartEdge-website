"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { billingPanelClass, billingSilverButtonClass } from "@/components/billing/billing-styles";

const darkSkeleton = "bg-white/10";
import type { MemberPaymentMethod, PaymentMethodsResponse } from "@/types/payment-methods";

function formatCardBrand(brand: string | null) {
  if (!brand) return "Card";
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function PaymentMethodRowSkeleton() {
  return (
    <div
      className={cn(billingPanelClass, "flex items-center justify-between gap-4")}
      aria-hidden
    >
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className={`size-9 shrink-0 rounded-md ${darkSkeleton}`} />
        <div className="min-w-0 space-y-2">
          <Skeleton className={`h-4 w-36 max-w-full ${darkSkeleton}`} />
          <Skeleton className={`h-3 w-24 ${darkSkeleton} bg-white/8`} />
        </div>
      </div>
      <Skeleton className={`h-6 w-16 shrink-0 rounded-full ${darkSkeleton}`} />
    </div>
  );
}

function PaymentMethodRow({ method }: { method: MemberPaymentMethod }) {
  return (
    <div className={cn(billingPanelClass, "flex items-center justify-between gap-4")}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
          <CreditCard className="size-4 text-zinc-400" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">
            {formatCardBrand(method.brand)} ···· {method.last4 ?? "····"}
          </p>
          {method.expMonth && method.expYear ? (
            <p className="text-sm text-zinc-500">
              Expires {String(method.expMonth).padStart(2, "0")}/{method.expYear}
            </p>
          ) : null}
        </div>
      </div>
      {method.isDefault ? (
        <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent ring-1 ring-accent/30">
          Default
        </span>
      ) : null}
    </div>
  );
}

export function BillingPaymentMethods() {
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState<MemberPaymentMethod[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/stripe/payment-methods");
        const data = (await response.json()) as PaymentMethodsResponse & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not load payment methods");
        if (!cancelled) setMethods(data.paymentMethods ?? []);
      } catch (error) {
        if (!cancelled) toast.error((error as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePortal = async () => {
    try {
      const response = await fetch("/api/stripe/create-portal-session", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6 text-center md:text-left">
      <div>
        <h2 className="text-lg font-semibold text-white">Payment methods</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Cards saved in Stripe for your subscriptions and invoices.
        </p>
      </div>

      {loading ? (
        <ul className="space-y-3" aria-busy="true" aria-label="Loading payment methods">
          {Array.from({ length: 2 }).map((_, i) => (
            <li key={i}>
              <PaymentMethodRowSkeleton />
            </li>
          ))}
        </ul>
      ) : methods.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No saved cards yet. Complete checkout or add a card in the billing portal.
        </p>
      ) : (
        <ul className="space-y-3">
          {methods.map((method) => (
            <li key={method.id}>
              <PaymentMethodRow method={method} />
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        className={billingSilverButtonClass}
        onClick={() => void handlePortal()}
      >
        {methods.length > 0 ? "Update payment method" : "Add payment method"}
      </Button>
    </section>
  );
}
