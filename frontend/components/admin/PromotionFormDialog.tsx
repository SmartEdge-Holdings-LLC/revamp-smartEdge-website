"use client";

import * as React from "react";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogOverlayContainerContext } from "@/components/ui/dialog-overlay-container";
import { Input } from "@/components/ui/input";
import {
  AdminApiError,
  createAdminPromotion,
  listAdminUsers,
  updateAdminPromotion,
} from "@/lib/api/adminApi";
import { cn } from "@/lib/utils";
import type { AdminPromotion, CreatePromotionPayload } from "@/types/promotions";
import type { AdminUserListItem } from "@/types/admin";

const fieldClass =
  "h-9 border-white/12 bg-white/5 typo-body-sm text-slate-100 placeholder:text-subtle focus-visible:border-accent/55 focus-visible:ring-accent/25";

const labelClass =
  "block typo-caption font-semibold uppercase tracking-[0.12em] text-subtle";

type FormState = {
  code: string;
  description: string;
  discountPercent: string;
  maxRedemptions: string;
  expiresAt: string;
  status: "active" | "inactive";
  assignedUserIds: string[];
};

const emptyForm = (): FormState => ({
  code: "",
  description: "",
  discountPercent: "10",
  maxRedemptions: "",
  expiresAt: "",
  status: "active",
  assignedUserIds: [],
});

function promotionToForm(promo: AdminPromotion): FormState {
  return {
    code: promo.code,
    description: promo.description,
    discountPercent: String(promo.discountPercent),
    maxRedemptions: promo.maxRedemptions != null ? String(promo.maxRedemptions) : "",
    expiresAt: promo.expiresAt ? promo.expiresAt.slice(0, 10) : "",
    status: promo.status === "inactive" ? "inactive" : "active",
    assignedUserIds: [...promo.assignedUserIds],
  };
}

interface PromotionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: AdminPromotion | null;
  onSaved: () => void;
}

export function PromotionFormDialog({
  open,
  onOpenChange,
  promotion,
  onSaved,
}: PromotionFormDialogProps) {
  const isEdit = Boolean(promotion?.id);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [dialogContainer, setDialogContainer] = React.useState<HTMLElement | null>(null);
  const [userSearch, setUserSearch] = React.useState("");
  const [userResults, setUserResults] = React.useState<AdminUserListItem[]>([]);
  const [userSearchLoading, setUserSearchLoading] = React.useState(false);
  const [assignedUsers, setAssignedUsers] = React.useState<
    Array<{ _id: string; email: string; name: string }>
  >([]);

  React.useEffect(() => {
    if (!open) return;
    if (promotion) {
      setForm(promotionToForm(promotion));
      setAssignedUsers(promotion.assignedUsers ?? []);
    } else {
      setForm(emptyForm());
      setAssignedUsers([]);
    }
    setUserSearch("");
    setUserResults([]);
  }, [open, promotion]);

  React.useEffect(() => {
    if (!open) return;
    const q = userSearch.trim();
    if (q.length < 2) {
      setUserResults([]);
      return;
    }
    const id = setTimeout(async () => {
      setUserSearchLoading(true);
      try {
        const res = await listAdminUsers({ search: q, limit: 8, page: 1 });
        setUserResults(res.users);
      } catch {
        setUserResults([]);
      } finally {
        setUserSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [userSearch, open]);

  const addUser = (user: AdminUserListItem) => {
    if (form.assignedUserIds.includes(user._id)) return;
    setForm((prev) => ({
      ...prev,
      assignedUserIds: [...prev.assignedUserIds, user._id],
    }));
    setAssignedUsers((prev) => [
      ...prev,
      { _id: user._id, email: user.email, name: user.name },
    ]);
    setUserSearch("");
    setUserResults([]);
  };

  const removeUser = (userId: string) => {
    setForm((prev) => ({
      ...prev,
      assignedUserIds: prev.assignedUserIds.filter((id) => id !== userId),
    }));
    setAssignedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = form.code.trim().toUpperCase();
    const description = form.description.trim();
    const discountPercent = Number(form.discountPercent);

    if (!description) {
      toast.error("Description is required");
      return;
    }
    if (!isEdit && !code) {
      toast.error("Code is required");
      return;
    }
    if (!isEdit && (!Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100)) {
      toast.error("Discount must be between 1 and 100");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && promotion) {
        await updateAdminPromotion(promotion.id, {
          description,
          status: form.status,
          assignedUserIds: form.assignedUserIds,
        });
        toast.success("Promotion updated");
      } else {
        const maxRedemptions = form.maxRedemptions.trim()
          ? Number(form.maxRedemptions)
          : null;
        const payload: CreatePromotionPayload = {
          code,
          description,
          discountPercent,
          status: form.status,
          assignedUserIds: form.assignedUserIds,
          expiresAt: form.expiresAt.trim()
            ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
            : null,
          maxRedemptions:
            maxRedemptions != null && Number.isFinite(maxRedemptions) && maxRedemptions > 0
              ? maxRedemptions
              : null,
        };
        await createAdminPromotion(payload);
        toast.success("Promotion created in Stripe");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to save promotion";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setDialogContainer}
        className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden border-white/10 bg-[#0c0c0c] p-0 text-slate-100"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogOverlayContainerContext.Provider value={dialogContainer}>
            <DialogTitle className="px-5 pt-4 typo-heading-md text-white">
              {isEdit ? "Edit promotion" : "Create promotion"}
            </DialogTitle>
            <DialogDescription className="px-5 typo-body-sm text-subtle">
              {isEdit
                ? "Update status, description, or assigned users. Discount and expiry are fixed after creation."
                : "Creates a Stripe coupon and promotion code for checkout."}
            </DialogDescription>

            <form className="space-y-4 overflow-y-auto px-5 pb-5 pt-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className={labelClass} htmlFor="promo-code">
                    Code
                  </label>
                  <Input
                    id="promo-code"
                    className={cn(fieldClass, "font-mono uppercase")}
                    placeholder="SAVE20"
                    value={form.code}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                    }
                    disabled={isEdit || submitting}
                    required={!isEdit}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <label className={labelClass} htmlFor="promo-discount">
                    Discount (%)
                  </label>
                  <Input
                    id="promo-discount"
                    type="number"
                    min={1}
                    max={100}
                    className={fieldClass}
                    value={form.discountPercent}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, discountPercent: e.target.value }))
                    }
                    disabled={isEdit || submitting}
                    required={!isEdit}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="promo-description">
                  Description
                </label>
                <Input
                  id="promo-description"
                  className={fieldClass}
                  placeholder="Summer launch discount"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="promo-redemptions">
                    Redemptions (max)
                  </label>
                  <Input
                    id="promo-redemptions"
                    type="number"
                    min={1}
                    className={fieldClass}
                    placeholder="Unlimited"
                    value={form.maxRedemptions}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, maxRedemptions: e.target.value }))
                    }
                    disabled={isEdit || submitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="promo-expires">
                    Expires
                  </label>
                  <Input
                    id="promo-expires"
                    type="date"
                    className={fieldClass}
                    value={form.expiresAt}
                    onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                    disabled={isEdit || submitting}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="promo-status">
                  Status
                </label>
                <select
                  id="promo-status"
                  className={cn(fieldClass, "w-full rounded-md px-3")}
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      status: e.target.value as "active" | "inactive",
                    }))
                  }
                  disabled={submitting}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2 rounded-lg border border-white/10 bg-white/2 p-3">
                <p className={labelClass}>Assign to users (optional)</p>
                <p className="typo-caption text-subtle">
                  Leave empty for a public code anyone can use at checkout. Add users to restrict
                  this code to them only.
                </p>
                {assignedUsers.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {assignedUsers.map((u) => (
                      <li
                        key={u._id}
                        className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 typo-caption text-slate-200"
                      >
                        <span className="max-w-[180px] truncate">{u.email}</span>
                        <button
                          type="button"
                          className="text-subtle hover:text-white"
                          onClick={() => removeUser(u._id)}
                          aria-label={`Remove ${u.email}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                  <Input
                    className={cn(fieldClass, "pl-9")}
                    placeholder="Search users by email or name…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    disabled={submitting}
                  />
                  {userSearchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-subtle" />
                  )}
                </div>
                {userResults.length > 0 && (
                  <ul className="max-h-36 overflow-y-auto rounded-md border border-white/10 bg-[#111]">
                    {userResults.map((u) => (
                      <li key={u._id}>
                        <button
                          type="button"
                          className="flex w-full flex-col px-3 py-2 text-left typo-body-sm hover:bg-white/6"
                          onClick={() => addUser(u)}
                        >
                          <span className="text-white">{u.email}</span>
                          <span className="text-subtle">{u.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <DialogFooter className="gap-2 pt-2 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-subtle hover:text-white"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-accent text-slate-950 hover:brightness-105"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {isEdit ? "Save changes" : "Create promotion"}
                </Button>
              </DialogFooter>
            </form>
        </DialogOverlayContainerContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
