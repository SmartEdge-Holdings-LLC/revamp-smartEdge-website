import Stripe from "stripe";
import { env } from "../config/env";
import {
  getConfiguredStripeProducts,
  getPlanKeyFromProductId,
  type StripeProductKey,
} from "../config/stripeProducts";
import type { PlanName } from "../models/User";

export const stripe = new Stripe(env.stripeSecretKey);

type SubscriptionItemLike = {
  price?:
    | string
    | { id?: string; product?: string | { id?: string } | null };
};

type SubscriptionLike = {
  items: { data: SubscriptionItemLike[] };
};

/** Resolve the default recurring price for Stripe Checkout from a product ID. */
export async function resolveDefaultPriceIdForProduct(productId: string): Promise<string> {
  const product = await stripe.products.retrieve(productId);
  const defaultPrice = product.default_price;

  if (typeof defaultPrice === "string" && defaultPrice) {
    return defaultPrice;
  }
  if (defaultPrice && typeof defaultPrice === "object" && "id" in defaultPrice) {
    return defaultPrice.id;
  }

  const prices = await stripe.prices.list({ product: productId, active: true, limit: 20 });
  const recurring = prices.data.find((p) => p.type === "recurring");
  if (recurring) return recurring.id;
  if (prices.data[0]) return prices.data[0].id;

  throw new Error(`No active price found for product ${productId}`);
}

export function getPriceIdFromSubscriptionItem(
  item: SubscriptionItemLike | undefined
): string {
  const price = item?.price;
  if (!price) return "";
  if (typeof price === "string") return price;
  return price.id ?? "";
}

export function getProductIdFromSubscriptionItem(
  item: SubscriptionItemLike | undefined
): string | null {
  const price = item?.price;
  if (!price) return null;
  if (typeof price === "string") return null;
  const product = price.product;
  if (typeof product === "string") return product;
  if (product && typeof product === "object" && "id" in product) return product.id;
  return null;
}

export function getPlanNameFromProductId(productId: string): PlanName {
  const key = getPlanKeyFromProductId(productId);
  return key ?? "free";
}

let priceIdToPlanKey: Map<string, StripeProductKey> | null = null;

/** Map every price under configured Stripe products → plan key (handles catalog drift). */
export async function ensurePriceIdToPlanKeyMap(): Promise<Map<string, StripeProductKey>> {
  if (priceIdToPlanKey) return priceIdToPlanKey;

  const map = new Map<string, StripeProductKey>();
  for (const entry of getConfiguredStripeProducts()) {
    const ids = await listBillingIdsForProduct(entry.productId);
    for (const id of ids) {
      map.set(id, entry.key);
    }
  }
  priceIdToPlanKey = map;
  return map;
}

export async function getPlanKeyFromPriceId(priceId: string): Promise<StripeProductKey | null> {
  const id = priceId.trim();
  if (!id) return null;
  const map = await ensurePriceIdToPlanKeyMap();
  return map.get(id) ?? null;
}

export async function resolvePlanNameFromPriceId(priceId: string): Promise<PlanName> {
  if (!priceId) return "free";

  const fromMap = await getPlanKeyFromPriceId(priceId);
  if (fromMap) return fromMap;

  try {
    const price = await stripe.prices.retrieve(priceId);
    const productId =
      typeof price.product === "string" ? price.product : price.product?.id ?? null;
    if (productId) {
      const fromProduct = getPlanNameFromProductId(productId);
      if (fromProduct !== "free") return fromProduct;
    }
  } catch {
    /* ignore invalid price */
  }
  return "free";
}

export async function resolvePlanNameFromSubscription(
  subscription: SubscriptionLike
): Promise<PlanName> {
  const item = subscription.items.data[0];
  const productId = getProductIdFromSubscriptionItem(item);
  if (productId) {
    const fromProduct = getPlanNameFromProductId(productId);
    if (fromProduct !== "free") return fromProduct;
  }
  return resolvePlanNameFromPriceId(getPriceIdFromSubscriptionItem(item));
}

/** Full subscription from Stripe (expanded price/product for plan resolution). */
export async function retrieveStripeSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price.product"],
  });
}

/** All Stripe Price IDs attached to a product (active and inactive). */
export async function listPriceIdsForProduct(productId: string): Promise<string[]> {
  const priceIds: string[] = [];
  let startingAfter: string | undefined;

  for (;;) {
    const page = await stripe.prices.list({
      product: productId,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    priceIds.push(...page.data.map((p) => p.id));
    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }

  return priceIds;
}

/**
 * Price IDs plus legacy `plan_*` IDs for a product (WordPress imports often store `plan_*` on `User.priceId`).
 */
export async function listBillingIdsForProduct(productId: string): Promise<string[]> {
  const ids = new Set<string>(await listPriceIdsForProduct(productId));

  try {
    let startingAfter: string | undefined;
    for (;;) {
      const page = await stripe.plans.list({
        product: productId,
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      for (const plan of page.data) ids.add(plan.id);
      if (!page.has_more) break;
      startingAfter = page.data[page.data.length - 1]?.id;
    }
  } catch {
    /* plans API may be unavailable on some accounts */
  }

  return [...ids];
}
