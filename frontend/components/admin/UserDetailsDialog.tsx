"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTimeET } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import {
  adminUserAggregateStatus,
  adminUserPlansLabel,
  type AdminUserListItem,
} from "@/types/admin";

interface UserDetailsDialogProps {
  user: AdminUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateTimeDisplay(value?: string | null): string | null {
  if (!value) return null;
  const formatted = formatDateTimeET(value);
  return formatted === "—" ? null : formatted;
}

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

function fullAddress(u: AdminUserListItem) {
  const parts = [u.address, u.city, u.state, u.zip, u.country].filter(
    (p): p is string => typeof p === "string" && p.trim().length > 0
  );
  return parts.length > 0 ? parts.join(", ") : null;
}

/** Plan badge — same palette family as the table page. */
function planBadgeClass(plan?: string) {
  switch (plan) {
    case "pro":
      return "bg-accent/12 text-accent ring-1 ring-inset ring-accent/30";
    case "enterprise":
      return "bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-400/25";
    case "starter":
      return "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-400/25";
    default:
      return "bg-white/5 text-subtle ring-1 ring-inset ring-white/10";
  }
}

/** Subscription status badge — matches the redesigned palette in users/page.tsx. */
function statusBadgeClass(status?: string) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25";
    case "trialing":
      return "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-400/25";
    case "past_due":
      return "bg-amber-500/12 text-amber-300 ring-1 ring-inset ring-amber-400/30";
    case "unpaid":
      return "bg-rose-500/12 text-rose-300 ring-1 ring-inset ring-rose-400/35";
    case "canceled":
      return "bg-zinc-500/10 text-zinc-300 ring-1 ring-inset ring-zinc-400/20";
    default:
      return "bg-white/5 text-subtle ring-1 ring-inset ring-white/10";
  }
}

/**
 * Small copy button — reveals a `Check` for ~1.4s after click. Only rendered
 * for mono-font ID rows so users can grab Stripe IDs without hand-selecting.
 */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  const onClick = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  }, [value]);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      onClick={onClick}
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-white/8 hover:text-slate-200"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}

/**
 * One key/value row. Label sits in a fixed-width column on the left so values
 * line up cleanly down the page (definition-list pattern). `mono` swaps the
 * value to a monospace caption — used for Stripe IDs and Mongo IDs.
 */
function Row({
  label,
  value,
  mono,
  copyable,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  copyable?: boolean;
}) {
  const isEmpty =
    value == null ||
    value === "" ||
    (typeof value === "string" && value.trim() === "");
  const displayValue = isEmpty ? "—" : value;
  const canCopy = copyable && !isEmpty && typeof value === "string";

  return (
    <div className="grid grid-cols-[130px_1fr] items-baseline gap-3 py-1.5">
      <span className="typo-caption text-subtle">{label}</span>
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            "min-w-0 flex-1 wrap-break-word",
            isEmpty ? "text-slate-500" : "text-slate-100",
            mono
              ? "font-mono text-[11.5px] tracking-tight text-slate-300"
              : "text-[13px] leading-5"
          )}
        >
          {displayValue}
        </span>
        {canCopy ? <CopyButton value={value as string} /> : null}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col">
      <h3 className="mb-1 typo-caption font-medium uppercase tracking-[0.14em] text-subtle">
        {title}
      </h3>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

export function UserDetailsDialog({
  user,
  open,
  onOpenChange,
}: UserDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto border-white/8 bg-[#0a0a0a] p-0 text-slate-100 sm:max-w-xl">
        {user ? (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-white/8 px-5 py-4">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-[13px] font-semibold text-slate-100 ring-1 ring-inset ring-white/10">
                {initialsOf(user.name)}
              </span>
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-[15px] font-semibold leading-tight text-white">
                  {user.name}
                </DialogTitle>
                <DialogDescription className="mt-0.5 truncate typo-caption text-subtle">
                  {user.email}
                </DialogDescription>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge
                    className={cn(
                      "rounded-full border-transparent px-2 py-0.5 typo-caption font-medium capitalize",
                      planBadgeClass(adminUserPlansLabel(user))
                    )}
                  >
                    {adminUserPlansLabel(user)}
                  </Badge>
                  <Badge
                    className={cn(
                      "rounded-full border-transparent px-2 py-0.5 typo-caption font-medium capitalize",
                      statusBadgeClass(adminUserAggregateStatus(user))
                    )}
                  >
                    {adminUserAggregateStatus(user).replace("_", " ")}
                  </Badge>
                  {user.brandSubscriptions?.smartedge?.cancelAtPeriodEnd ||
                  user.brandSubscriptions?.jonah?.cancelAtPeriodEnd ? (
                    <Badge className="rounded-full border-transparent bg-amber-500/12 px-2 py-0.5 typo-caption font-medium text-amber-300 ring-1 ring-inset ring-amber-400/30">
                      Cancels at period end
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-5 px-5 py-4">
              <Section title="Account">
                <Row label="User ID" mono copyable value={user._id} />
                <Row label=" Role" value={user.wpRole ?? null} />
              </Section>

              <Section title="Subscription">
                <Row
                  label="Stripe Customer"
                  mono
                  copyable
                  value={user.stripeCustomerId ?? null}
                />
                {(["smartedge", "jonah"] as const).map((brand) => {
                  const snap = user.brandSubscriptions?.[brand];
                  if (!snap?.stripeSubscriptionId) return null;
                  const title = brand === "smartedge" ? "SmartEdge" : "Jonah";
                  return (
                    <React.Fragment key={brand}>
                      <Row
                        label={`${title} plan`}
                        value={snap.planName}
                      />
                      <Row
                        label={`${title} subscription`}
                        mono
                        copyable
                        value={snap.stripeSubscriptionId}
                      />
                      <Row label={`${title} price`} mono copyable value={snap.priceId} />
                      <Row
                        label={`${title} status`}
                        value={snap.subscriptionStatus.replace("_", " ")}
                      />
                      <Row
                        label={`${title} renews / ends`}
                        value={formatDateTimeDisplay(snap.currentPeriodEnd)}
                      />
                    </React.Fragment>
                  );
                })}
              </Section>

              <Section title="Contact">
                <Row label="Phone" value={user.phoneNumber ?? null} />
                <Row label="Address" value={user.address ?? null} />
                <Row label="City" value={user.city ?? null} />
                <Row label="State / Region" value={user.state ?? null} />
                <Row label="ZIP / Postal" value={user.zip ?? null} />
                <Row label="Country" value={user.country ?? null} />
                <Row label="Full Address" value={fullAddress(user)} />
              </Section>

              <Section title="Timeline">
                <Row label="Created" value={formatDateTimeDisplay(user.createdAt)} />
                <Row
                  label="Last Updated"
                  value={formatDateTimeDisplay(user.updatedAt)}
                />
              </Section>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
