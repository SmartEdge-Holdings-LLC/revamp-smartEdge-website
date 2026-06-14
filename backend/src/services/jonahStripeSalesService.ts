import {
  getJonahStripeScope,
  aggregateJonahPaidInvoicesByDay,
} from "./jonahStripeScope";
import {
  parseSalesRange,
  type AdminSalesByDayResult,
  type SalesRange,
} from "./adminStripeSalesService";

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

export const jonahStripeSalesService = {
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

    const scope = await getJonahStripeScope();
    const { byDay, totalCents, currency } = await aggregateJonahPaidInvoicesByDay(
      createdGte,
      scope
    );
    const dateKeys = buildUtcDateKeys(startUtc, dayCount);

    const salesByDay = dateKeys.map((date) => {
      const amountCents = byDay.get(date) ?? 0;
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
