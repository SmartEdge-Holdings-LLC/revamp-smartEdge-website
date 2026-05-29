import { User, type IUser, type PlanName } from "../models/User";
import { Subscription } from "../models/Subscription";
import { resolveBrand } from "../lib/subscriptionBrand";
import {
  stripe,
  getPlanNameFromProductId,
  retrieveStripeSubscription,
  getPriceIdFromSubscriptionItem,
  getProductIdFromSubscriptionItem,
  resolvePlanNameFromPriceId,
} from "../lib/stripe";
import { refreshUserSubscriptionSummary } from "./subscriptionEntitlementsService";
import type { StripeBrand } from "../config/stripeProducts";

type StripeSubscription = Awaited<ReturnType<typeof retrieveStripeSubscription>>;
type StripeCheckoutSession = Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;

function subscriptionPeriodEnd(sub: StripeSubscription): Date | null {
  const end = sub.items?.data?.[0]?.current_period_end;
  return typeof end === "number" && end > 0 ? new Date(end * 1000) : null;
}

function subscriptionPeriodStart(sub: StripeSubscription): Date | null {
  const start = sub.items?.data?.[0]?.current_period_start;
  return typeof start === "number" && start > 0 ? new Date(start * 1000) : null;
}

export async function resolvePlanFromSubscription(
  sub: StripeSubscription,
  checkoutProductId?: string | null
): Promise<PlanName> {
  if (checkoutProductId?.trim()) {
    const fromCheckout = getPlanNameFromProductId(checkoutProductId.trim());
    if (fromCheckout !== "free") return fromCheckout;
  }

  const item = sub.items.data[0];
  const lineProductId = getProductIdFromSubscriptionItem(item);
  if (lineProductId) {
    const fromLine = getPlanNameFromProductId(lineProductId);
    if (fromLine !== "free") return fromLine;
  }

  const priceId = getPriceIdFromSubscriptionItem(item);
  const fromPrice = await resolvePlanNameFromPriceId(priceId);
  if (fromPrice !== "free") return fromPrice;

  const metaProductId = sub.metadata?.productId?.trim();
  if (metaProductId) {
    const fromMeta = getPlanNameFromProductId(metaProductId);
    if (fromMeta !== "free") return fromMeta;
  }

  return "free";
}

async function removeStaleBrandSubscriptions(
  userId: string,
  brand: StripeBrand,
  keepStripeSubscriptionId: string
): Promise<void> {
  await Subscription.deleteMany({
    userId,
    brand,
    stripeSubscriptionId: { $ne: keepStripeSubscriptionId },
  });
}

/** Sync every Stripe subscription for this customer (dual-brand checkout). */
export async function syncAllCustomerSubscriptionsFromStripe(
  userId: string,
  customerId?: string | null
): Promise<void> {
  const user = await User.findById(userId).select("stripeCustomerId").lean();
  const cid = customerId?.trim() || user?.stripeCustomerId?.trim();
  if (!cid) return;

  const list = await stripe.subscriptions.list({
    customer: cid,
    status: "all",
    limit: 100,
  });

  const priority = ["active", "trialing", "past_due", "unpaid", "canceled"];
  const sorted = [...list.data].sort(
    (a, b) => priority.indexOf(a.status) - priority.indexOf(b.status)
  );

  for (const row of sorted) {
    if (row.status === "incomplete_expired") continue;
    const full = await retrieveStripeSubscription(row.id);
    await applySubscriptionToUser(userId, full);
  }
}

/** Upsert Subscription by Stripe sub id (handles legacy rows missing `brand`). */
export async function applySubscriptionToUser(
  userId: string,
  sub: StripeSubscription,
  checkoutProductId?: string | null
): Promise<IUser | null> {
  const item = sub.items.data[0];
  const priceId = getPriceIdFromSubscriptionItem(item);
  const planName = await resolvePlanFromSubscription(sub, checkoutProductId);
  const productId =
    checkoutProductId?.trim() ||
    getProductIdFromSubscriptionItem(item) ||
    sub.metadata?.productId?.trim() ||
    null;
  const brand = resolveBrand(planName, productId);
  const periodEnd = subscriptionPeriodEnd(sub);
  const periodStart = subscriptionPeriodStart(sub);

  await User.findByIdAndUpdate(userId, {
    stripeCustomerId: String(sub.customer),
  });

  await removeStaleBrandSubscriptions(userId, brand, sub.id);

  const payload = {
    userId,
    brand,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: String(sub.customer),
    status: sub.status,
    priceId: priceId || "unknown",
    planName,
    currentPeriodStart: periodStart ?? undefined,
    currentPeriodEnd: periodEnd ?? undefined,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
    trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : undefined,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
  };

  // Upsert by (userId, brand) so we never insert a second row for the same member/brand.
  // Legacy DBs may still have a unique `userId_1` index — run scripts/migrate-subscription-brands.ts.
  await Subscription.findOneAndUpdate({ userId, brand }, payload, {
    upsert: true,
    returnDocument: "after",
    setDefaultsOnInsert: true,
  });

  return refreshUserSubscriptionSummary(userId);
}

export async function resolveUserIdFromCheckoutSession(
  session: StripeCheckoutSession
): Promise<string | null> {
  const fromMeta = session.metadata?.userId?.trim();
  if (fromMeta) return fromMeta;

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (customerId) {
    const byCustomer = await User.findOne({ stripeCustomerId: customerId }).select("_id").lean();
    if (byCustomer?._id) return String(byCustomer._id);
  }

  const email = session.customer_email?.trim().toLowerCase();
  if (email) {
    const byEmail = await User.findOne({ email }).select("_id").lean();
    if (byEmail?._id) return String(byEmail._id);
  }

  return null;
}

export function extractSubscriptionId(session: StripeCheckoutSession): string | null {
  const sub = session.subscription;
  if (typeof sub === "string" && sub) return sub;
  if (sub && typeof sub === "object" && "id" in sub && typeof sub.id === "string") {
    return sub.id;
  }
  return null;
}

/** After redirect from Checkout — sync Mongo from session_id (webhook backup). */
export async function syncUserFromCheckoutSessionId(
  userId: string,
  sessionId: string
): Promise<IUser> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "line_items"],
  });

  if (session.mode !== "subscription") {
    throw new Error("Checkout session is not a subscription");
  }

  const ownerId = await resolveUserIdFromCheckoutSession(session);
  if (!ownerId || ownerId !== userId) {
    throw new Error("Checkout session does not belong to this account");
  }

  const subscriptionId = extractSubscriptionId(session);
  if (!subscriptionId) {
    throw new Error("Subscription not ready yet — try again in a few seconds");
  }

  const checkoutProductId = session.metadata?.productId?.trim() ?? null;
  const sub = await retrieveStripeSubscription(subscriptionId);
  await applySubscriptionToUser(userId, sub, checkoutProductId);

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  await syncAllCustomerSubscriptionsFromStripe(userId, customerId);

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  return user;
}

export async function handleCheckoutSessionCompleted(
  session: StripeCheckoutSession
): Promise<void> {
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["subscription"],
  });

  const userId = await resolveUserIdFromCheckoutSession(full);
  const subscriptionId = extractSubscriptionId(full);
  const checkoutProductId = full.metadata?.productId?.trim() ?? null;

  if (!userId) {
    console.warn("[stripe-webhook] checkout.session.completed: no user resolved", full.id);
    return;
  }
  if (!subscriptionId) {
    console.warn("[stripe-webhook] checkout.session.completed: no subscription on session", full.id);
    return;
  }

  const sub = await retrieveStripeSubscription(subscriptionId);
  await applySubscriptionToUser(userId, sub, checkoutProductId);

  const customerId =
    typeof full.customer === "string" ? full.customer : full.customer?.id ?? null;
  await syncAllCustomerSubscriptionsFromStripe(userId, customerId);
}

export async function resolveUserIdFromSubscription(sub: StripeSubscription): Promise<string | null> {
  const byRecord = await Subscription.findOne({ stripeSubscriptionId: sub.id })
    .select("userId")
    .lean();
  if (byRecord?.userId) return String(byRecord.userId);

  const customerId = String(sub.customer);
  const user = await User.findOne({ stripeCustomerId: customerId }).select("_id").lean();
  if (user?._id) return String(user._id);

  const userId = sub.metadata?.userId?.trim();
  return userId || null;
}

export async function handleSubscriptionUpdated(
  sub: StripeSubscription | { id: string }
): Promise<void> {
  const full = await retrieveStripeSubscription(sub.id);
  const userId = await resolveUserIdFromSubscription(full);
  if (userId) {
    await applySubscriptionToUser(userId, full);
  } else {
    console.warn("[stripe-webhook] subscription update: no user for", full.id);
  }
}
