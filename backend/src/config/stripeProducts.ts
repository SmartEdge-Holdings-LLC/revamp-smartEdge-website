export type StripeBrand = "smartedge" | "jonah";
export type StripeTier = "weekly" | "monthlyStandard" | "monthlyVip";

/** URL / UI tier param (pricing cards, register link). */
export type PlanTierParam = "weekly" | "standard" | "vip";

/** @deprecated Use StripeTier — kept for Jonah admin sync */
export type JonahProductKey = StripeTier;

export type StripeProductKey =
  | "smartedgeWeekly"
  | "smartedgeMonthlyStandard"
  | "smartedgeMonthlyVip"
  | "jonahWeekly"
  | "jonahMonthlyStandard"
  | "jonahMonthlyVip";

/** Read live from process.env so a running server picks up .env after restart. */
const PRODUCT_ENV_KEYS: Record<StripeProductKey, string> = {
  smartedgeWeekly: "STRIPE_SMARTEDGE_WEEKLY_PRODUCT_ID",
  smartedgeMonthlyStandard: "STRIPE_SMARTEDGE_MONTHLY_STANDARD_PRODUCT_ID",
  smartedgeMonthlyVip: "STRIPE_SMARTEDGE_MONTHLY_VIP_PRODUCT_ID",
  jonahWeekly: "STRIPE_JONAH_WEEKLY_PRODUCT_ID",
  jonahMonthlyStandard: "STRIPE_JONAH_MONTHLY_STANDARD_PRODUCT_ID",
  jonahMonthlyVip: "STRIPE_JONAH_MONTHLY_VIP_PRODUCT_ID",
};

const PRODUCT_META: Record<StripeProductKey, { brand: StripeBrand; tier: StripeTier }> = {
  smartedgeWeekly: { brand: "smartedge", tier: "weekly" },
  smartedgeMonthlyStandard: { brand: "smartedge", tier: "monthlyStandard" },
  smartedgeMonthlyVip: { brand: "smartedge", tier: "monthlyVip" },
  jonahWeekly: { brand: "jonah", tier: "weekly" },
  jonahMonthlyStandard: { brand: "jonah", tier: "monthlyStandard" },
  jonahMonthlyVip: { brand: "jonah", tier: "monthlyVip" },
};

const TIER_PARAM_TO_STRIPE: Record<PlanTierParam, StripeTier> = {
  weekly: "weekly",
  standard: "monthlyStandard",
  vip: "monthlyVip",
};

function readProductIdFromEnv(envVar: string): string {
  return (process.env[envVar] ?? "").trim();
}

export type ConfiguredStripeProduct = {
  key: StripeProductKey;
  brand: StripeBrand;
  tier: StripeTier;
  productId: string;
};

/** All configured Stripe product IDs (SmartEdge + Jonah). */
export function getConfiguredStripeProducts(): ConfiguredStripeProduct[] {
  const entries: ConfiguredStripeProduct[] = [];
  for (const key of Object.keys(PRODUCT_ENV_KEYS) as StripeProductKey[]) {
    const productId = readProductIdFromEnv(PRODUCT_ENV_KEYS[key]);
    if (!productId) continue;
    const { brand, tier } = PRODUCT_META[key];
    entries.push({ key, brand, tier, productId });
  }
  return entries;
}

export function getProductIdByBrandAndTier(
  brand: StripeBrand,
  tierParam: PlanTierParam
): string | null {
  const stripeTier = TIER_PARAM_TO_STRIPE[tierParam];
  const entry = getConfiguredStripeProducts().find(
    (p) => p.brand === brand && p.tier === stripeTier
  );
  return entry?.productId ?? null;
}

export function resolveCheckoutProductId(input: {
  productId?: string;
  brand?: string;
  tier?: string;
}): string {
  const fromId = input.productId?.trim();
  if (fromId && isConfiguredStripeProductId(fromId)) {
    return fromId;
  }

  const brand = input.brand?.trim();
  const tier = input.tier?.trim();
  if (
    brand &&
    tier &&
    (brand === "smartedge" || brand === "jonah") &&
    (tier === "weekly" || tier === "standard" || tier === "vip")
  ) {
    const resolved = getProductIdByBrandAndTier(brand, tier);
    if (resolved) return resolved;
  }

  const configured = getConfiguredStripeProducts();
  throw new Error(
    configured.length === 0
      ? "No Stripe products in backend .env. Set STRIPE_SMARTEDGE_* and STRIPE_JONAH_* PRODUCT_ID vars, then restart the API."
      : "Invalid or unconfigured Stripe product. Restart the backend after updating .env."
  );
}

/** Jonah-only products (handicapper sync / admin). */
export function getJonahStripeProductIds(): { key: JonahProductKey; productId: string }[] {
  return getConfiguredStripeProducts()
    .filter((p) => p.brand === "jonah")
    .map((p) => ({ key: p.tier, productId: p.productId }));
}

export function isConfiguredStripeProductId(productId: string): boolean {
  const id = productId.trim();
  return getConfiguredStripeProducts().some((e) => e.productId === id);
}

export function getPlanKeyFromProductId(productId: string): StripeProductKey | null {
  const id = productId.trim();
  return getConfiguredStripeProducts().find((e) => e.productId === id)?.key ?? null;
}

/** Logged once at API startup. */
export function logConfiguredStripeProducts(): void {
  const products = getConfiguredStripeProducts();
  if (products.length === 0) {
    console.warn(
      "⚠️  No Stripe product IDs loaded. Add STRIPE_SMARTEDGE_* / STRIPE_JONAH_* to backend/.env and restart."
    );
    return;
  }
  console.log(`✅ Stripe checkout products loaded: ${products.length}`);
  for (const p of products) {
    console.log(`   · ${p.brand}/${p.tier} → ${p.productId}`);
  }
}
