"use client";

import { Plus, TicketPercent } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type PromoStatus = "active" | "inactive" | "expired";

type PromotionRow = {
  id: string;
  code: string;
  label: string;
  discount: string;
  status: PromoStatus;
  redemptions: number;
  maxRedemptions: number | null;
  expires: string;
};

/** Placeholder rows until Stripe promotion codes are wired to the API. */
const PLACEHOLDER_PROMOTIONS: PromotionRow[] = [];

function statusBadgeClass(status: PromoStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25";
    case "expired":
      return "bg-amber-500/12 text-amber-300 ring-1 ring-inset ring-amber-400/30";
    default:
      return "bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-400/20";
  }
}

function statusLabel(status: PromoStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const COLUMN_COUNT = 6;

export default function PromotionsPage() {
  const promotions = PLACEHOLDER_PROMOTIONS;
  const isEmpty = promotions.length === 0;

  return (
    <>
      <AdminHeader
        title="Promotions"
        subtitle="Coupon codes and discounts for checkout and subscriptions"
      />

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="typo-heading-lg text-white">Promotion codes</h1>
            <p className="mt-1 typo-body-md text-subtle">
              Create and manage discount codes synced with Stripe checkout.
            </p>
          </div>
          <Button
            type="button"
            disabled
            className="bg-accent text-slate-950 hover:brightness-105 disabled:opacity-50"
            title="Available when Stripe promotion API is connected"
          >
            <Plus className="mr-2 size-4" />
            Create promotion
          </Button>
        </div>

        <section className="overflow-hidden">
          <Table className="text-slate-100">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Code
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Description
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Discount
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Redemptions
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Expires
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/5">
              {isEmpty ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={COLUMN_COUNT} className="py-14">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <TicketPercent className="size-6 text-subtle" strokeWidth={1.5} />
                      </span>
                      <p className="typo-body-sm font-medium text-white">No promotions yet</p>
                      <p className="max-w-md typo-caption text-subtle">
                        Promotion codes from Stripe will appear here once the admin API is
                        connected. Checkout already supports promo codes via Stripe.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promo) => (
                  <TableRow
                    key={promo.id}
                    className="border-white/5 transition hover:bg-white/4"
                  >
                    <TableCell className="font-mono typo-body-sm font-medium text-white">
                      {promo.code}
                    </TableCell>
                    <TableCell className="max-w-[200px] typo-body-sm text-white">
                      {promo.label}
                    </TableCell>
                    <TableCell className="typo-body-sm text-white">{promo.discount}</TableCell>
                    <TableCell className="typo-body-sm tabular-nums text-white">
                      {promo.maxRedemptions != null
                        ? `${promo.redemptions} / ${promo.maxRedemptions}`
                        : promo.redemptions}
                    </TableCell>
                    <TableCell className="typo-body-sm text-subtle">{promo.expires}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold",
                          statusBadgeClass(promo.status)
                        )}
                      >
                        {statusLabel(promo.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>
      </div>
    </>
  );
}
