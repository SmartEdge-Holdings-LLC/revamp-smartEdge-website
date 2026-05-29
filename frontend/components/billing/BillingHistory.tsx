"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { billingPanelClass } from "@/components/billing/billing-styles";

const darkSkeleton = "bg-white/10";
import type { BillingHistoryResponse, BillingInvoice } from "@/types/billing-history";

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function statusClass(status: string) {
  if (status === "paid") return "bg-emerald-500/15 text-emerald-400 ring-emerald-500/35";
  if (status === "open") return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
  if (status === "void") return "bg-white/10 text-zinc-400 ring-white/15";
  return "bg-white/10 text-subtle ring-white/15";
}

function InvoiceRowSkeleton() {
  return (
    <div
      className={cn(
        billingPanelClass,
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      )}
      aria-hidden
    >
      <div className="flex min-w-0 gap-3">
        <Skeleton className={`size-9 shrink-0 rounded-md ${darkSkeleton}`} />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className={`h-4 w-40 max-w-full ${darkSkeleton}`} />
          <Skeleton className={`h-3 w-24 ${darkSkeleton} bg-white/8`} />
          <Skeleton className={`h-3 w-16 ${darkSkeleton} bg-white/8`} />
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
        <Skeleton className={`h-6 w-14 rounded-full ${darkSkeleton}`} />
        <Skeleton className={`h-4 w-16 ${darkSkeleton}`} />
        <Skeleton className={`h-4 w-12 ${darkSkeleton} bg-white/8`} />
      </div>
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: BillingInvoice }) {
  const title =
    invoice.description ??
    (invoice.number ? `Invoice ${invoice.number}` : "Subscription invoice");
  const amount = invoice.status === "paid" ? invoice.amountPaid : invoice.total;

  return (
    <div className={cn(billingPanelClass, "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between")}>
      <div className="flex min-w-0 gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
          <FileText className="size-4 text-zinc-400" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-0.5 text-sm text-zinc-500">{formatDate(invoice.created)}</p>
          {invoice.number ? (
            <p className="text-xs text-zinc-600">#{invoice.number}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1",
            statusClass(invoice.status)
          )}
        >
          {statusLabel(invoice.status)}
        </span>
        <p className="text-sm font-medium text-white">{formatMoney(amount, invoice.currency)}</p>
        {invoice.hostedInvoiceUrl ? (
          <a
            href={invoice.hostedInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            View
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : invoice.invoicePdf ? (
          <a
            href={invoice.invoicePdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            PDF
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function BillingHistory() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/stripe/billing-history");
        const data = (await response.json()) as BillingHistoryResponse & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not load billing history");
        if (!cancelled) setInvoices(data.invoices ?? []);
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

  return (
    <section className="mx-auto max-w-2xl space-y-6 text-center md:text-left">
      <div>
        <h2 className="text-lg font-semibold text-white">Billing history</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Past and current invoices from your Stripe subscriptions.
        </p>
      </div>

      {loading ? (
        <ul className="space-y-3" aria-busy="true" aria-label="Loading invoices">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i}>
              <InvoiceRowSkeleton />
            </li>
          ))}
        </ul>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No invoices yet. Invoices appear here after your first successful payment.
        </p>
      ) : (
        <ul className="space-y-3">
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <InvoiceRow invoice={invoice} />
            </li>
          ))}
        </ul>
      )}

    
    </section>
  );
}
