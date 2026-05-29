import type { SubscriptionPlanSelection } from "@/lib/subscription-plan";

export async function startSubscriptionCheckout(
  selection: SubscriptionPlanSelection
): Promise<void> {
  const response = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      brand: selection.brand,
      tier: selection.tier,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Unable to start checkout");
  }
  if (!data.url) {
    throw new Error("Checkout URL missing");
  }

  window.location.href = data.url;
}
