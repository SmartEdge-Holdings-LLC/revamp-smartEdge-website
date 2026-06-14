"use client";

import * as React from "react";
import { Pencil, Plus, RefreshCw, TicketPercent, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PromotionFormDialog } from "@/components/admin/PromotionFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminApiError,
  deleteAdminPromotion,
  listAdminPromotions,
} from "@/lib/api/adminApi";
import { cn } from "@/lib/utils";
import type { AdminPromotion, PromotionStatus } from "@/types/promotions";

const COLUMN_COUNT = 7;

function statusBadgeClass(status: PromotionStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25";
    case "expired":
      return "bg-amber-500/12 text-amber-300 ring-1 ring-inset ring-amber-400/30";
    default:
      return "bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-400/20";
  }
}

function statusLabel(status: PromotionStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = React.useState<AdminPromotion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editPromotion, setEditPromotion] = React.useState<AdminPromotion | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const fetchPromotions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminPromotions();
      setPromotions(result.promotions);
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load promotions";
      setError(message);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchPromotions();
  }, [fetchPromotions]);

  const handleDelete = async (promo: AdminPromotion) => {
    if (!confirm(`Deactivate and remove "${promo.code}"? This cannot be undone.`)) return;
    setDeletingId(promo.id);
    try {
      await deleteAdminPromotion(promo.id);
      toast.success("Promotion removed");
      await fetchPromotions();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreate = () => {
    setEditPromotion(null);
    setFormOpen(true);
  };

  const openEdit = (promo: AdminPromotion) => {
    setEditPromotion(promo);
    setFormOpen(true);
  };

  const isEmpty = !loading && promotions.length === 0;

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
              Create Stripe discount codes, assign them to users, and track redemptions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-subtle hover:text-white"
              onClick={() => void fetchPromotions()}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
            <Button
              type="button"
              className="bg-accent text-slate-950 hover:brightness-105"
              onClick={openCreate}
            >
              <Plus className="mr-2 size-4" />
              Create promotion
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 typo-body-sm text-red-300">
            {error}
          </p>
        )}

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
                <TableHead className="w-[88px] typo-caption uppercase tracking-[0.12em] text-subtle">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5 hover:bg-transparent">
                    {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full max-w-[120px] bg-white/10" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isEmpty ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={COLUMN_COUNT} className="py-14">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <TicketPercent className="size-6 text-subtle" strokeWidth={1.5} />
                      </span>
                      <p className="typo-body-sm font-medium text-white">No promotions yet</p>
                      <p className="max-w-md typo-caption text-subtle">
                        Create a promotion to generate a Stripe coupon. Assign codes to specific
                        users or leave them public for anyone at checkout.
                      </p>
                      <Button
                        type="button"
                        className="mt-2 bg-accent text-slate-950 hover:brightness-105"
                        onClick={openCreate}
                      >
                        <Plus className="mr-2 size-4" />
                        Create promotion
                      </Button>
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
                      {promo.description}
                      {promo.assignedUsers.length > 0 && (
                        <p className="mt-0.5 typo-caption text-subtle">
                          {promo.assignedUsers.length} user
                          {promo.assignedUsers.length === 1 ? "" : "s"} assigned
                        </p>
                      )}
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
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-subtle hover:text-white"
                          onClick={() => openEdit(promo)}
                          aria-label={`Edit ${promo.code}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-subtle hover:text-red-400"
                          onClick={() => void handleDelete(promo)}
                          disabled={deletingId === promo.id}
                          aria-label={`Delete ${promo.code}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>
      </div>

      <PromotionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        promotion={editPromotion}
        onSaved={() => void fetchPromotions()}
      />
    </>
  );
}
