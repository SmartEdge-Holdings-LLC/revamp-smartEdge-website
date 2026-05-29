import type { SubscriptionPlanSelection } from "@/lib/subscription-plan";

const STORAGE_KEY = "sep_pending_checkout_plan";

/** Remember selected plan when moving from register → sign in (keeps `/login` URL clean). */
export function stashPendingCheckoutPlan(plan: SubscriptionPlanSelection): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

/** Read and clear stashed plan (one-time use on login page). */
export function consumePendingCheckoutPlan(): SubscriptionPlanSelection | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SubscriptionPlanSelection;
    if (parsed?.brand && parsed?.tier) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}
