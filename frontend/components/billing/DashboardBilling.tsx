"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  ChevronRight,
  CreditCard,
  FileText,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getActiveBrandPlans } from "@/lib/subscription-access";
import { Subscription } from "@/types";
import type { LucideIcon } from "lucide-react";
import { BillingHistory } from "@/components/billing/BillingHistory";
import { BillingPaymentMethods } from "@/components/billing/BillingPaymentMethods";
import {
  billingPanelClass,
  billingSecondaryButtonClass,
} from "@/components/billing/billing-styles";
import type { MemberEntitlements } from "@/types/entitlements";

type BillingTab = "overview" | "payment-methods" | "billing-history";

const tabs: { id: BillingTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "payment-methods", label: "Payment methods" },
  { id: "billing-history", label: "Billing history" },
];

function BillingTabs({
  active,
  onChange,
}: {
  active: BillingTab;
  onChange: (tab: BillingTab) => void;
}) {
  return (
    <nav
      className="mt-4 flex flex-wrap justify-start gap-x-8 gap-y-1 border-b border-white/10"
      aria-label="Billing sections"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative -mb-px cursor-pointer pb-3 text-sm transition-colors",
              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
            {isActive ? (
              <span className="absolute inset-x-0 bottom-0 h-px bg-white" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

function BillingNavItem({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-none cursor-pointer"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
        <Icon className="size-4 text-zinc-400" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="flex items-start gap-1.5">
          <ChevronRight
            className="mt-0.5 size-4 shrink-0 overflow-hidden text-zinc-400 opacity-0 transition-all duration-200 w-0 group-hover:w-4 group-hover:opacity-100"
            aria-hidden
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-white">{title}</span>
            <span className="mt-0.5 block text-sm text-zinc-500">{description}</span>
          </span>
        </span>
      </span>
    </button>
  );
}

function formatPlanLabel(plan: string) {
  return plan
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBrandLabel(brand: string) {
  return brand === "jonah" ? "Jonah" : "SmartEdge";
}

function statusBadgeClass(status: string) {
  if (status === "active" || status === "trialing") {
    return "bg-accent/15 text-accent ring-accent/30";
  }
  if (status === "past_due" || status === "unpaid") {
    return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
  }
  return "bg-white/10 text-subtle ring-white/15";
}

function membershipTitleFromPlan(planName: string) {
  const normalized = planName.toLowerCase();
  if (normalized.includes("jonah")) return "Jonah";
  if (normalized !== "free") return "SmartEdge";
  return "Membership";
}

function BillingPlanCard({
  title,
  status,
  cancelAtPeriodEnd,
  active = true,
}: {
  title: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
  active?: boolean;
}) {
  return (
    <div className={billingPanelClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1",
            statusBadgeClass(status)
          )}
        >
          {status.replace("_", " ")}
        </span>
      </div>
      {cancelAtPeriodEnd ? (
        <p className="mt-1 text-sm text-amber-300">Cancels at period end.</p>
      ) : null}
      {!active ? (
        <p className="mt-2 text-xs text-zinc-500">
          No active access for this brand — upgrade or renew to unlock picks.
        </p>
      ) : null}
    </div>
  );
}

function BillingEntitlementOverview({
  entitlements,
  subscription,
}: {
  entitlements?: MemberEntitlements;
  subscription: Subscription;
}) {
  const rows = [
    entitlements?.smartedge ? { key: "smartedge", ent: entitlements.smartedge } : null,
    entitlements?.jonah ? { key: "jonah", ent: entitlements.jonah } : null,
  ].filter(Boolean) as { key: string; ent: NonNullable<MemberEntitlements["smartedge"]> }[];

  if (rows.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BillingPlanCard
          title="No active plan"
          status="inactive"
          cancelAtPeriodEnd={false}
          active={false}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {rows.map(({ key, ent }) => (
        <BillingPlanCard
          key={key}
          title={formatBrandLabel(ent.brand)}
          status={ent.subscriptionStatus}
          cancelAtPeriodEnd={ent.cancelAtPeriodEnd}
          active={ent.active}
        />
      ))}
    </div>
  );
}

function hasBillingAlert(subscription: Subscription) {
  const ents = subscription.entitlements;
  const rows = [ents?.smartedge, ents?.jonah].filter(Boolean);
  if (rows.some((e) => e?.subscriptionStatus === "past_due" || e?.subscriptionStatus === "unpaid")) {
    return true;
  }
  if (rows.some((e) => e?.cancelAtPeriodEnd)) return true;
  return getActiveBrandPlans(subscription.entitlements).length === 0;
}

function alertMessage(subscription: Subscription) {
  const ents = subscription.entitlements;
  if (ents?.smartedge?.subscriptionStatus === "past_due" || ents?.jonah?.subscriptionStatus === "past_due") {
    return "A payment failed on one of your plans. Update your payment method in the Stripe portal to restore access.";
  }
  if (ents?.smartedge?.cancelAtPeriodEnd || ents?.jonah?.cancelAtPeriodEnd) {
    return "A plan is set to cancel at period end. Open the customer portal if you want to keep your subscription active.";
  }
  if (getActiveBrandPlans(subscription.entitlements).length === 0) {
    return "You do not have an active subscription. Choose a plan to unlock premium picks and member features.";
  }
  return null;
}

async function openStripePortal() {
  const response = await fetch("/api/stripe/create-portal-session", { method: "POST" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  window.location.href = data.url;
}

type DashboardBillingProps = {
  subscription: Subscription;
};

export function DashboardBilling({ subscription }: DashboardBillingProps) {
  const router = useRouter();
  const [tab, setTab] = useState<BillingTab>("overview");
  const activeBrands = getActiveBrandPlans(subscription.entitlements);
  const alertText = alertMessage(subscription);
  const showAlert = hasBillingAlert(subscription) && alertText;

  const handlePortal = async () => {
    try {
      await openStripePortal();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const overviewHeadline =
    activeBrands.length > 0
      ? `${activeBrands.length} active plan${activeBrands.length > 1 ? "s" : ""}`
      : "No active plan";

  const overviewPlanLabel =
    activeBrands.length > 0
      ? activeBrands.map((e) => formatPlanLabel(e.planName)).join(" · ")
      : "No active plan";

  const overviewNextBilling = activeBrands.find((e) => e.currentPeriodEnd)?.currentPeriodEnd ?? null;

  return (
    <div className="w-full">
      <div className="max-w-4xl text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Billing</h1>
        <BillingTabs active={tab} onChange={setTab} />
      </div>

      <div className="mx-auto mt-16 w-full max-w-4xl">
        {tab === "overview" ? (
          <div className="space-y-10">
            <section>
              <p className="text-sm text-zinc-400">Your membership</p>

              <div className="mt-8 space-y-6">
                <div className="space-y-1">
                
                  {overviewNextBilling ? (
                    <p className="text-sm text-zinc-500">
                      Next billing:{" "}
                      <span className="text-white">
                        {new Date(overviewNextBilling).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </span>
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="text-5xl font-normal tracking-tight text-white">{overviewHeadline}</p>
                  <p className="mt-2 text-2xl font-normal tracking-tight text-zinc-300">
                    {overviewPlanLabel}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className={cn("rounded-full", billingSecondaryButtonClass)}
                  onClick={() => router.push("/pricing")}
                >
                  {activeBrands.length > 0 ? "Add or change plan" : "View plans"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("rounded-full", billingSecondaryButtonClass)}
                  onClick={() => void handlePortal()}
                >
                  Manage subscription
                </Button>
              </div>
            </section>

            {showAlert ? (
              <div
                className="flex flex-col gap-4 rounded-lg border border-amber-500/35 bg-amber-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                role="status"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" aria-hidden />
                  <p className="text-sm text-amber-100/90">{alertText}</p>
                </div>
                <Button
                  type="button"
                  className="shrink-0 rounded-md bg-amber-500 px-4 text-sm font-medium text-black hover:bg-amber-400"
                  onClick={() =>
                    activeBrands.length === 0 ? router.push("/pricing") : void handlePortal()
                  }
                >
                  {activeBrands.length === 0 ? "View plans" : "Open billing portal"}
                </Button>
              </div>
            ) : null}

            {[subscription.entitlements?.smartedge, subscription.entitlements?.jonah].filter(Boolean)
              .length > 1 ? (
              <BillingEntitlementOverview
                entitlements={subscription.entitlements}
                subscription={subscription}
              />
            ) : null}

            <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
              <BillingNavItem
                icon={CreditCard}
                title="Payment methods"
                description="Add or change payment method"
                onClick={() => setTab("payment-methods")}
              />
              <BillingNavItem
                icon={FileText}
                title="Billing history"
                description="View past and current invoices"
                onClick={() => setTab("billing-history")}
              />
              <BillingNavItem
                icon={BarChart3}
                title="Pricing"
                description="View plans and package details"
                onClick={() => router.push("/pricing")}
              />
              <BillingNavItem
                icon={Sparkles}
                title="Manage subscription"
                description="Cancel, renew, or change plans in Stripe"
                onClick={() => void handlePortal()}
              />
            </div>
          </div>
        ) : null}

        {tab === "payment-methods" ? <BillingPaymentMethods /> : null}

        {tab === "billing-history" ? <BillingHistory /> : null}
      </div>
    </div>
  );
}
