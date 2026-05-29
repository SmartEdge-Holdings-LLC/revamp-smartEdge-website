import { stripe } from "../lib/stripe";

export const SALES_RANGES = ["7d", "4w", "90d"] as const;
export type SalesRange = (typeof SALES_RANGES)[number];

export type DailySalePoint = {
  /** Calendar date in UTC (`YYYY-MM-DD`). */
  date: string;
  /** Gross sales for the day in major currency units (e.g. USD). */
  amount: number;
  amountCents: number;
};

export type AdminSalesByDayResult = {
  range: SalesRange;
  days: number;
  currency: string;
  total: number;
  totalCents: number;
  salesByDay: DailySalePoint[];
  generatedAt: string;
};

function rangeToDays(range: SalesRange): number {
  switch (range) {
    case "7d":
      return 7;
    case "4w":
      return 28;
    case "90d":
      return 90;
    default:
      return 7;
  }
}

function utcDateKey(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildUtcDateKeys(start: Date, dayCount: number): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  );
  for (let i = 0; i < dayCount; i++) {
    const y = cursor.getUTCFullYear();
    const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const d = String(cursor.getUTCDate()).padStart(2, "0");
    keys.push(`${y}-${m}-${d}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

function isSaleTransaction(type: string): boolean {
  return type === "charge" || type === "payment";
}

async function fetchSalesCentsByDay(
  createdGte: number
): Promise<{ byDay: Map<string, number>; currency: string }> {
  const byDay = new Map<string, number>();
  let currency = "usd";
  let startingAfter: string | undefined;

  for (;;) {
    const page = await stripe.balanceTransactions.list({
      limit: 100,
      created: { gte: createdGte },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const txn of page.data) {
      if (!isSaleTransaction(txn.type)) continue;
      const key = utcDateKey(txn.created);
      byDay.set(key, (byDay.get(key) ?? 0) + txn.amount);
      if (txn.currency) currency = txn.currency;
    }

    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }

  return { byDay, currency };
}

export function parseSalesRange(value: unknown): SalesRange {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (raw === "4w" || raw === "28d") return "4w";
  if (raw === "90d") return "90d";
  return "7d";
}

export const adminStripeSalesService = {
  async getSalesByDay(rangeInput: unknown): Promise<AdminSalesByDayResult> {
    const range = parseSalesRange(rangeInput);
    const dayCount = rangeToDays(range);
    const now = new Date();
    const endUtc = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
    );
    const startUtc = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (dayCount - 1))
    );
    const createdGte = Math.floor(startUtc.getTime() / 1000);

    const { byDay, currency } = await fetchSalesCentsByDay(createdGte);
    const dateKeys = buildUtcDateKeys(startUtc, dayCount);

    let totalCents = 0;
    const salesByDay: DailySalePoint[] = dateKeys.map((date) => {
      const amountCents = byDay.get(date) ?? 0;
      totalCents += amountCents;
      return {
        date,
        amountCents,
        amount: Math.round(amountCents) / 100,
      };
    });

    return {
      range,
      days: dayCount,
      currency,
      total: Math.round(totalCents) / 100,
      totalCents,
      salesByDay,
      generatedAt: endUtc.toISOString(),
    };
  },
};
