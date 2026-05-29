import type { StripeBrand, StripeTier } from "./stripe-product-types";

/** Stripe product IDs — must match backend `STRIPE_*_PRODUCT_ID` vars. */
export const STRIPE_PRODUCT_IDS: Record<StripeBrand, Record<StripeTier, string>> = {
  smartedge: {
    weekly: process.env.NEXT_PUBLIC_STRIPE_SMARTEDGE_WEEKLY_PRODUCT_ID ?? "",
    monthlyStandard: process.env.NEXT_PUBLIC_STRIPE_SMARTEDGE_MONTHLY_STANDARD_PRODUCT_ID ?? "",
    monthlyVip: process.env.NEXT_PUBLIC_STRIPE_SMARTEDGE_MONTHLY_VIP_PRODUCT_ID ?? "",
  },
  jonah: {
    weekly: process.env.NEXT_PUBLIC_STRIPE_JONAH_WEEKLY_PRODUCT_ID ?? "",
    monthlyStandard: process.env.NEXT_PUBLIC_STRIPE_JONAH_MONTHLY_STANDARD_PRODUCT_ID ?? "",
    monthlyVip: process.env.NEXT_PUBLIC_STRIPE_JONAH_MONTHLY_VIP_PRODUCT_ID ?? "",
  },
};

export function getStripeProductId(brand: StripeBrand, tier: StripeTier): string {
  return STRIPE_PRODUCT_IDS[brand][tier];
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
