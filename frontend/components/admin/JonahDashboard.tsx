"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDownRight,
  CircleDollarSign,
  CreditCard,
  LineChart,
  RefreshCw,
  TrendingUp,
  Users,
  UserX,
} from "lucide-react";
import { AdminSalesChart } from "@/components/admin/AdminSalesChart";
import {
  getJonahAnalytics,
  listJonahUsers,
  type JonahAnalyticsOverview,
} from "@/lib/api/adminApi";
import { formatDateET } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { JonahUserListItem } from "@/types/admin";

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPercent(n: number): string {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

type MetricCard = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "default" | "revenue" | "warning";
};

function buildMetricCards(a: JonahAnalyticsOverview): MetricCard[] {
  const currency = a.currency || "usd";
  return [
    {
      key: "wau",
      label: "Weekly active subscribers",
      value: formatCount(a.weeklyActiveUsers),
      hint: `Since ${formatDateET(a.period.weeklyActiveFrom)}`,
      icon: TrendingUp,
    },
    {
      key: "totalUsers",
      label: "Total Jonah subscribers",
      value: formatCount(a.totalUsers),
      icon: Users,
    },
    {
      key: "active",
      label: "Active subscriptions",
      value: formatCount(a.activeSubscribers),
      hint: "Active / trialing",
      icon: CreditCard,
    },
    {
      key: "inactiveSubs",
      label: "Inactive subscribers",
      value: formatCount(a.totalInactiveSubscribers),
      hint: "Had Jonah, not active now",
      icon: UserX,
      accent: "warning",
    },
    {
      key: "churn",
      label: "Churn rate",
      value: formatPercent(a.churnRatePercent),
      hint: `Last ${a.period.churnWindowDays} days`,
      icon: ArrowDownRight,
      accent: "warning",
    },
    {
      key: "newWeekly",
      label: "New subscriptions (weekly)",
      value: formatCount(a.newSubscriptionsWeekly),
      icon: TrendingUp,
    },
    {
      key: "arpu",
      label: "Avg revenue per customer",
      value: formatMoney(a.averageRevenuePerCustomer, currency),
      hint: "Jonah MRR ÷ paying customers",
      icon: CircleDollarSign,
      accent: "revenue",
    },
    {
      key: "mrr",
      label: "Monthly recurring revenue",
      value: formatMoney(a.monthlyRecurringRevenue, currency),
      hint: "Jonah Stripe subscriptions",
      icon: LineChart,
      accent: "revenue",
    },
    {
      key: "weeklyRev",
      label: "Weekly revenue",
      value: formatMoney(a.weeklyRevenue, currency),
      hint: `Jonah paid invoices · last ${a.period.revenueWindowDays} days`,
      icon: CircleDollarSign,
      accent: "revenue",
    },
  ];
}

function accentRing(accent: MetricCard["accent"]) {
  switch (accent) {
    case "revenue":
      return "ring-accent/25";
    case "warning":
      return "ring-amber-500/20";
    default:
      return "ring-white/10";
  }
}

function MetricCardBlock({ card }: { card: MetricCard }) {
  const Icon = card.icon;
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)] backdrop-blur-md transition hover:border-white/15 hover:bg-white/[0.07]",
        accentRing(card.accent)
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="typo-caption font-semibold uppercase tracking-[0.14em] text-subtle">
          {card.label}
        </span>
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
          <Icon className="size-4 text-slate-200" />
        </span>
      </div>
      <p className="mt-4 typo-display-md tracking-tight text-white">{card.value}</p>
      {card.hint ? <p className="mt-1.5 typo-caption text-slate-500">{card.hint}</p> : null}
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="h-34 rounded-2xl bg-white/5" />
      ))}
    </div>
  );
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "active":
    case "trialing":
      return "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30";
    case "past_due":
    case "unpaid":
      return "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30";
    default:
      return "bg-white/10 text-slate-200 ring-1 ring-white/15";
  }
}

export function JonahDashboard() {
  const [analytics, setAnalytics] = React.useState<JonahAnalyticsOverview | null>(null);
  const [recentUsers, setRecentUsers] = React.useState<JonahUserListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        getJonahAnalytics(),
        listJonahUsers({ page: 1, limit: 5 }),
      ]);
      setAnalytics(analyticsRes.analytics);
      setRecentUsers(usersRes.users);
    } catch (err) {
      setAnalytics(null);
      setRecentUsers([]);
      setError(err instanceof Error ? err.message : "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const cards = analytics ? buildMetricCards(analytics) : [];

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="typo-caption text-slate-500">
          {analytics
            ? `Last updated ${formatDateET(analytics.generatedAt)}`
            : "Loading Jonah metrics…"}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer border-white/12 bg-white/5 text-slate-100 hover:bg-white/10"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading ? <MetricsSkeleton /> : null}

      {!loading && analytics ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <MetricCardBlock key={card.key} card={card} />
          ))}
        </section>
      ) : null}

      <AdminSalesChart scope="jonah" />

      <section className="rounded-2xl border border-white/10 bg-white/5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="typo-heading-md text-white">Recent Jonah subscribers</h2>
            <p className="typo-caption text-subtle">Latest on Jonah plans</p>
          </div>
          <Link
            href="/admin/handicappers"
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 typo-body-sm text-slate-100 transition hover:bg-white/10"
          >
            <LineChart className="size-4" /> View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-white/5" />
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              No Jonah subscribers yet. Run sync if needed.
            </p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="typo-caption font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentUsers.map((u) => (
                  <tr key={u._id} className="transition hover:bg-white/3">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 typo-caption font-semibold text-slate-100">
                          {u.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate typo-body-sm font-medium text-white">
                            {u.name}
                          </p>
                          <p className="truncate typo-caption text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className="border border-white/15 bg-white/5 text-slate-200">
                        {u.jonahProductName ?? u.currentPlan}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 typo-caption font-semibold capitalize",
                          statusBadgeClass(u.subscriptionStatus)
                        )}
                      >
                        {u.subscriptionStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right typo-body-sm text-slate-300">
                      {formatDateET(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
