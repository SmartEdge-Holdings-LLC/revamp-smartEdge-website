import { getProductIdForPlan, type SubscriptionPlanSelection } from "@/lib/subscription-plan";
import { getSession } from "next-auth/react";

export async function startSubscriptionCheckout(
  selection: SubscriptionPlanSelection,
  options?: { promotionCode?: string | null; email?: string }
): Promise<void> {
  const promotionCode = options?.promotionCode?.trim().toUpperCase();

  // Get pending registration data if available
  const pendingReg = typeof window !== "undefined"
    ? sessionStorage.getItem("pendingRegistration")
    : null;
  const pendingRegistration = pendingReg ? JSON.parse(pendingReg) : null;

  // Get email from options or from session
  let email = options?.email;
  if (!email) {
    const session = await getSession();
    email = (session?.user as any)?.email;
  }

  const response = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      brand: selection.brand,
      tier: selection.tier,
      productId: getProductIdForPlan(selection),
      ...(email ? { email } : {}),
      ...(promotionCode ? { promotionCode } : {}),
      ...(pendingRegistration ? { pendingRegistration } : {}),
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
