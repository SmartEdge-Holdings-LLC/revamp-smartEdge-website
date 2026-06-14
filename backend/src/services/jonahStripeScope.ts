import { getJonahStripeProductIds } from "../config/stripeProducts";
import { listBillingIdsForProduct, stripe } from "../lib/stripe";
import { User } from "../models/User";

export type JonahStripeScope = {
  productIds: Set<string>;
  priceIds: Set<string>;
  customerIds: Set<string>;
};

const ACTIVE_STATUSES = ["active", "trialing"] as const;

/** Users who have (or had) a Jonah brand subscription on file. */
export function jonahUserFilter() {
  return {
    $or: [
      { "brandSubscriptions.jonah.stripeSubscriptionId": { $nin: [null, ""] } },
      { "brandSubscriptions.jonah.priceId": { $nin: [null, ""] } },
    ],
  };
}

/** Users with an active Jonah subscription in Mongo (source of truth for the dashboard). */
export function jonahActiveUserFilter() {
  return {
    "brandSubscriptions.jonah.subscriptionStatus": { $in: [...ACTIVE_STATUSES] },
  };
}

let scopeCache: { scope: JonahStripeScope; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

const subscriptionMetaCache = new Map<string, { brand?: string; productId?: string }>();

export async function getJonahStripeScope(): Promise<JonahStripeScope> {
  const now = Date.now();
  if (scopeCache && scopeCache.expiresAt > now) {
    return scopeCache.scope;
  }

  const productIds = new Set<string>();
  const priceIds = new Set<string>();

  for (const { productId } of getJonahStripeProductIds()) {
    productIds.add(productId);
    const billingIds = await listBillingIdsForProduct(productId);
    for (const id of billingIds) priceIds.add(id);
  }

  const users = await User.find(jonahUserFilter())
    .select("stripeCustomerId")
    .lean();

  const customerIds = new Set<string>();
  for (const user of users) {
    const cid = user.stripeCustomerId?.trim();
    if (cid) customerIds.add(cid);
  }

  const scope: JonahStripeScope = { productIds, priceIds, customerIds };
  scopeCache = { scope, expiresAt: now + CACHE_TTL_MS };
  return scope;
}

export function clearJonahStripeScopeCache(): void {
  scopeCache = null;
  subscriptionMetaCache.clear();
}

type StripeLineLike = {
  amount: number;
  price?: string | { id?: string; product?: string | { id?: string } | null } | null;
  plan?: { id?: string; product?: string | { id?: string } | null } | null;
  pricing?: {
    price_details?: { price?: string; product?: string };
  } | null;
};

function productIdFromPrice(price: StripeLineLike["price"]): string | null {
  if (!price || typeof price === "string") return null;
  const product = price.product;
  if (typeof product === "string") return product;
  if (product && typeof product === "object" && "id" in product) return product.id ?? null;
  return null;
}

export function lineMatchesJonahScope(line: StripeLineLike, scope: JonahStripeScope): boolean {
  const price = line.price;
  if (price) {
    const priceId = typeof price === "string" ? price : price.id;
    if (priceId && scope.priceIds.has(priceId)) return true;
    const productId = productIdFromPrice(price);
    if (productId && scope.productIds.has(productId)) return true;
  }

  const plan = line.plan;
  if (plan?.product) {
    const productId =
      typeof plan.product === "string" ? plan.product : plan.product?.id ?? null;
    if (productId && scope.productIds.has(productId)) return true;
  }

  const details = line.pricing?.price_details;
  if (details?.price && scope.priceIds.has(details.price)) return true;
  if (details?.product && scope.productIds.has(details.product)) return true;

  return false;
}

export function sumJonahLineCents(
  lines: StripeLineLike[] | undefined,
  scope: JonahStripeScope
): number {
  let total = 0;
  for (const line of lines ?? []) {
    if (lineMatchesJonahScope(line, scope)) {
      total += line.amount;
    }
  }
  return total;
}

type StripeSubscriptionLike = {
  metadata?: Record<string, string>;
  items: { data: Array<{ price?: string | { id?: string; product?: string | { id?: string } | null } | null }> };
};

async function getSubscriptionMeta(subscriptionId: string): Promise<{
  brand?: string;
  productId?: string;
}> {
  const cached = subscriptionMetaCache.get(subscriptionId);
  if (cached) return cached;

  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const meta = {
      brand: sub.metadata?.brand,
      productId: sub.metadata?.productId?.trim(),
    };
    subscriptionMetaCache.set(subscriptionId, meta);
    return meta;
  } catch {
    return {};
  }
}

/** Jonah subscription — requires metadata or Jonah product on a line item (not price-id-only). */
export function subscriptionMatchesJonahScope(
  sub: StripeSubscriptionLike,
  scope: JonahStripeScope
): boolean {
  if (sub.metadata?.brand === "jonah") return true;
  const metaProduct = sub.metadata?.productId?.trim();
  if (metaProduct && scope.productIds.has(metaProduct)) return true;

  for (const item of sub.items.data) {
    const price = item.price;
    if (!price || typeof price === "string") continue;
    const productId =
      typeof price.product === "string" ? price.product : price.product?.id;
    if (productId && scope.productIds.has(productId)) return true;
  }
  return false;
}

type StripePriceLike = {
  id?: string;
  unit_amount: number | null;
  currency?: string;
  product?: string | { id?: string } | null;
  recurring?: { interval: string; interval_count: number } | null;
};

/**
 * MRR from Mongo-active Jonah subscribers only (one Stripe sub per user, primary item).
 * Avoids counting canceled legacy subs still active in Stripe or duplicate line items.
 */
export async function computeJonahMrrFromActiveSubscribers(
  scope: JonahStripeScope
): Promise<{
  monthlyRecurringCents: number;
  activePayingCustomers: number;
  currency: string;
}> {
  const users = await User.find(jonahActiveUserFilter())
    .select("brandSubscriptions.jonah.stripeSubscriptionId")
    .lean();

  let monthlyRecurringCents = 0;
  let activePayingCustomers = 0;
  let currency = "usd";
  const seenSubscriptionIds = new Set<string>();

  for (const user of users) {
    const subId = user.brandSubscriptions?.jonah?.stripeSubscriptionId?.trim();
    if (!subId || seenSubscriptionIds.has(subId)) continue;

    try {
      const sub = await stripe.subscriptions.retrieve(subId, {
        expand: ["items.data.price"],
      });

      if (!ACTIVE_STATUSES.includes(sub.status as (typeof ACTIVE_STATUSES)[number])) {
        continue;
      }
      if (!subscriptionMatchesJonahScope(sub, scope)) continue;

      const item = sub.items.data[0];
      const price = item?.price;
      if (!price || typeof price === "string") continue;

      const cents = monthlyCentsFromJonahPrice(price, scope);
      if (cents <= 0) continue;

      seenSubscriptionIds.add(subId);
      monthlyRecurringCents += cents;
      activePayingCustomers += 1;
      if (price.currency) currency = price.currency;
    } catch {
      /* stale or missing Stripe subscription */
    }
  }

  return { monthlyRecurringCents, activePayingCustomers, currency };
}

export function monthlyCentsFromJonahPrice(
  price: StripePriceLike,
  scope: JonahStripeScope
): number {
  const productId =
    typeof price.product === "string" ? price.product : price.product?.id;
  if (!productId || !scope.productIds.has(productId)) return 0;

  const unit = price.unit_amount ?? 0;
  if (!price.recurring || unit <= 0) return 0;
  const count = price.recurring.interval_count || 1;
  switch (price.recurring.interval) {
    case "month":
      return unit / count;
    case "year":
      return unit / (12 * count);
    case "week":
      return (unit * 52) / (12 * count);
    case "day":
      return (unit * 365) / (12 * count);
    default:
      return unit;
  }
}

/** Stripe `Metadata` allows `null`; keep compatible with `Stripe.Invoice`. */
type StripeMetadata = Record<string, string> | null | undefined;

export type StripeInvoiceLike = {
  amount_paid?: number;
  created: number;
  currency?: string;
  customer?: string | { id?: string } | null;
  metadata?: StripeMetadata;
  lines?: { data?: StripeLineLike[] };
  subscription?: string | StripeSubscriptionLike | null;
  subscription_details?: { metadata?: StripeMetadata } | null;
  status_transitions?: { paid_at?: number | null } | null;
};

function invoicePaidUnix(invoice: StripeInvoiceLike): number {
  const paidAt = invoice.status_transitions?.paid_at;
  return typeof paidAt === "number" && paidAt > 0 ? paidAt : invoice.created;
}

function invoiceMetadataIsJonah(
  invoice: StripeInvoiceLike,
  scope: JonahStripeScope
): boolean {
  if (invoice.metadata?.brand === "jonah") return true;
  const invProduct = invoice.metadata?.productId?.trim();
  if (invProduct && scope.productIds.has(invProduct)) return true;

  const details = invoice.subscription_details?.metadata;
  if (details?.brand === "jonah") return true;
  const subProduct = details?.productId?.trim();
  if (subProduct && scope.productIds.has(subProduct)) return true;

  return false;
}

/** Cents from a paid invoice that belong to Jonah products. */
export async function getJonahCentsFromInvoice(
  invoice: StripeInvoiceLike,
  scope: JonahStripeScope
): Promise<number> {
  const paid = invoice.amount_paid ?? 0;
  if (paid <= 0) return 0;

  if (invoiceMetadataIsJonah(invoice, scope)) {
    return paid;
  }

  const fromLines = sumJonahLineCents(
    invoice.lines?.data as StripeLineLike[] | undefined,
    scope
  );
  if (fromLines > 0) return fromLines;

  const subRef = invoice.subscription;

  if (subRef && typeof subRef === "object" && subscriptionMatchesJonahScope(subRef, scope)) {
    return paid;
  }

  const resolvedSubId = typeof subRef === "string" ? subRef : undefined;
  if (resolvedSubId) {
    const meta = await getSubscriptionMeta(resolvedSubId);
    if (meta.brand === "jonah") return paid;
    if (meta.productId && scope.productIds.has(meta.productId)) return paid;

    try {
      const sub = await stripe.subscriptions.retrieve(resolvedSubId, {
        expand: ["items.data.price"],
      });
      if (subscriptionMatchesJonahScope(sub, scope)) return paid;
    } catch {
      /* ignore */
    }
  }

  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (customerId && scope.customerIds.has(customerId) && resolvedSubId) {
    return paid;
  }

  return 0;
}

function utcDateKey(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Aggregate paid Jonah invoice amounts by UTC day (subscriptions + renewals).
 * This matches Stripe revenue more reliably than unattributed charge.list scans.
 */
export async function aggregateJonahPaidInvoicesByDay(
  createdGte: number,
  scope: JonahStripeScope
): Promise<{ byDay: Map<string, number>; totalCents: number; currency: string }> {
  const byDay = new Map<string, number>();
  let totalCents = 0;
  let currency = "usd";
  let startingAfter: string | undefined;

  for (;;) {
    const page = await stripe.invoices.list({
      status: "paid",
      limit: 100,
      created: { gte: createdGte },
      expand: ["data.lines.data.price"],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const raw of page.data) {
      const invoice = raw as unknown as StripeInvoiceLike;
      const cents = await getJonahCentsFromInvoice(invoice, scope);
      if (cents <= 0) continue;

      const key = utcDateKey(invoicePaidUnix(invoice));
      byDay.set(key, (byDay.get(key) ?? 0) + cents);
      totalCents += cents;
      if (raw.currency) currency = raw.currency;
    }

    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }

  return { byDay, totalCents, currency };
}

type StripeChargeLike = {
  id: string;
  amount: number;
  created: number;
  status: string;
  customer?: string | { id?: string } | null;
  invoice?: string | StripeInvoiceLike | null;
  metadata?: StripeMetadata;
};

export async function getJonahCentsFromCharge(
  charge: StripeChargeLike,
  scope: JonahStripeScope
): Promise<number> {
  if (charge.status !== "succeeded") return 0;

  const metaProduct = charge.metadata?.productId?.trim();
  if (metaProduct && scope.productIds.has(metaProduct)) {
    return charge.amount;
  }

  let invoice: string | StripeInvoiceLike | null | undefined = charge.invoice;
  if (typeof invoice === "string") {
    try {
      const retrieved = await stripe.invoices.retrieve(invoice, {
        expand: ["lines.data.price"],
      });
      invoice = retrieved as unknown as StripeInvoiceLike;
    } catch {
      return 0;
    }
  }

  if (invoice && typeof invoice === "object") {
    return getJonahCentsFromInvoice(invoice, scope);
  }

  return 0;
}
