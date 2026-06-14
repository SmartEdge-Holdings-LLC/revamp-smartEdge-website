"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  getAdminSalesByDay,
  getJonahSalesByDay,
  type AdminSalesByDayResponse,
  type SalesRange,
} from "@/lib/api/adminApi";
import { formatDateET } from "@/lib/datetime";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const RANGE_OPTIONS: { value: SalesRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "4w", label: "4 weeks" },
  { value: "90d", label: "90 days" },
];

const chartConfig = {
  sales: {
    label: "Gross sales",
    color: "#EA693A",
  },
} satisfies ChartConfig;

function formatMoney(amount: number, currency: string, compact = false): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(amount);
}

type ChartRow = { date: string; sales: number };

function toChartRows(data: AdminSalesByDayResponse): ChartRow[] {
  return data.salesByDay.map((row) => ({
    date: row.date,
    sales: row.amount,
  }));
}

const SKELETON_BAR_HEIGHTS = [
  "h-[45%]",
  "h-[72%]",
  "h-[38%]",
  "h-[88%]",
  "h-[56%]",
  "h-[94%]",
  "h-[48%]",
  "h-[70%]",
  "h-[42%]",
  "h-[80%]",
  "h-[55%]",
  "h-[65%]",
];

function SalesChartSkeleton() {
  return (
    <div
      className="flex h-[250px] flex-col justify-end gap-3 px-2 pt-4 sm:px-4"
      aria-busy
      aria-label="Loading sales chart"
    >
      <div className="flex h-[210px] items-end justify-between gap-1 sm:gap-1.5">
        {SKELETON_BAR_HEIGHTS.map((heightClass, i) => (
          <Skeleton
            key={i}
            className={`w-full max-w-3 flex-1 rounded-t bg-white/10 ${heightClass}`}
          />
        ))}
      </div>
      <Skeleton className="h-3 w-full rounded bg-white/5" />
    </div>
  );
}

type AdminSalesChartProps = {
  /** `jonah` = handicapper dashboard (Jonah products only). */
  scope?: "admin" | "jonah";
};

export function AdminSalesChart({ scope = "admin" }: AdminSalesChartProps) {
  const [range, setRange] = React.useState<SalesRange>("4w");
  const [data, setData] = React.useState<AdminSalesByDayResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const fetchSales = scope === "jonah" ? getJonahSalesByDay : getAdminSalesByDay;

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchSales(range)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "Could not load sales");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range, fetchSales]);

  const currency = data?.currency ?? "usd";
  const chartData = React.useMemo(() => (data ? toChartRows(data) : []), [data]);
  const total = data?.total ?? 0;
  const rangeLabel =
    RANGE_OPTIONS.find((opt) => opt.value === range)?.label ?? "4 weeks";

  return (
    <Card className="border-white/10 bg-white/5 p-0 py-0 text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)] backdrop-blur-md">
      <CardHeader className="flex flex-col gap-4 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <div className="flex flex-1 flex-col justify-center gap-1">
          <CardTitle className="typo-heading-md text-white">
            {scope === "jonah" ? "Jonah sales" : "Stripe sales"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {scope === "jonah"
              ? "Gross sales from Jonah product subscriptions only"
              : "Gross charge volume by day from Stripe"}
          </CardDescription>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            {loading ? (
              <Skeleton className="h-8 w-28 rounded-md bg-white/10 sm:h-9 sm:w-32" />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {formatMoney(total, currency, true)}
              </p>
            )}
            <span className="text-sm font-normal text-slate-400">{rangeLabel}</span>
          </div>
        </div>
        <Select
          value={range}
          onValueChange={(value) => setRange(value as SalesRange)}
          disabled={loading}
        >
          <SelectTrigger
            aria-label="Sales date range"
            className="w-full min-w-36 sm:w-40"
          >
            <SelectValue className="sr-only" />
            <span className="truncate font-medium leading-none">{rangeLabel}</span>
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pb-4 sm:p-6 sm:pt-2">
        {error ? (
          <p className="flex h-[250px] items-center justify-center text-sm text-red-300/90">
            {error}
          </p>
        ) : loading ? (
          <SalesChartSkeleton />
        ) : chartData.length === 0 ? (
          <p className="flex h-[250px] items-center justify-center text-sm text-slate-500">
            No sales in this period.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-slate-400 [&_.recharts-cartesian-grid_line]:stroke-white/10"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => {
                  const date = new Date(`${value}T12:00:00.000Z`);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="border-white/10 bg-zinc-900 text-white"
                    formatter={(value) =>
                      formatMoney(Number(value), currency)
                    }
                    labelFormatter={(value) => {
                      const date = new Date(`${String(value)}T12:00:00.000Z`);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      });
                    }}
                  />
                }
              />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}

        {data && !loading ? (
          <p className="mt-2 text-right text-xs text-slate-600">
            Updated {formatDateET(data.generatedAt)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
