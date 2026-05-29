import { stripe } from "../lib/stripe";
import { Subscription } from "../models/Subscription";
import { User } from "../models/User";

const ACTIVE_STATUSES = ["active", "trialing"] as const;

export type AdminAnalyticsOverview = {
  weeklyActiveUsers: number;
  totalInactiveSubscribers: number;
  totalUsers: number;
  smartedgeActiveSubscribers: number;
  jonahActiveSubscribers: number;
  churnRatePercent: number;
  newSubscriptionsWeekly: number;
  averageRevenuePerCustomer: number;
  currency: string;
  /** Stripe-derived monthly recurring revenue (normalized to monthly). */
  monthlyRecurringRevenue: number;
  /** Gross charge volume from Stripe in the last 7 days (major units, e.g. USD). */
  weeklyRevenue: number;
  generatedAt: string;
  period: {
    weeklyActiveFrom: string;
    churnWindowDays: number;
    revenueWindowDays: number;
  };
};

function daysAgo(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function activeBrandFilter(brand: "smartedge" | "jonah") {
  return {
    [`brandSubscriptions.${brand}.subscriptionStatus`]: { $in: [...ACTIVE_STATUSES] },
  };
}

type StripePriceLike = {
  unit_amount: number | null;
  currency?: string;
  recurring?: { interval: string; interval_count: number } | null;
};

/** Normalize a Stripe recurring price to approximate monthly cents. */
function monthlyCentsFromPrice(price: StripePriceLike): number {
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

async function fetchStripeRevenueMetrics(): Promise<{
  monthlyRecurringRevenue: number;
  weeklyRevenue: number;
  currency: string;
  averageRevenuePerCustomer: number;
}> {
  let monthlyRecurringCents = 0;
  const payingCustomers = new Set<string>();
  let currency = "usd";

  for (const status of ["active", "trialing"] as const) {
    let startingAfter: string | undefined;
    for (;;) {
      const page = await stripe.subscriptions.list({
        status,
        limit: 100,
        expand: ["data.items.data.price"],
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      for (const sub of page.data) {
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (customerId) payingCustomers.add(customerId);

        for (const item of sub.items.data) {
          const price = item.price;
          if (!price || typeof price === "string") continue;
          if (price.currency) currency = price.currency;
          monthlyRecurringCents += monthlyCentsFromPrice(price);
        }
      }

      if (!page.has_more) break;
      startingAfter = page.data[page.data.length - 1]?.id;
    }
  }

  const weekStart = Math.floor(daysAgo(7).getTime() / 1000);
  let weeklyCents = 0;
  let txnStartingAfter: string | undefined;

  for (;;) {
    const txns = await stripe.balanceTransactions.list({
      limit: 100,
      created: { gte: weekStart },
      ...(txnStartingAfter ? { starting_after: txnStartingAfter } : {}),
    });

    for (const txn of txns.data) {
      if (txn.type === "charge" || txn.type === "payment") {
        weeklyCents += txn.amount;
        if (txn.currency) currency = txn.currency;
      }
    }

    if (!txns.has_more) break;
    txnStartingAfter = txns.data[txns.data.length - 1]?.id;
  }

  const activePayingCustomers = payingCustomers.size;
  const monthlyRecurringRevenue = monthlyRecurringCents / 100;
  const weeklyRevenue = weeklyCents / 100;
  const averageRevenuePerCustomer =
    activePayingCustomers > 0 ? monthlyRecurringRevenue / activePayingCustomers : 0;

  return {
    monthlyRecurringRevenue,
    weeklyRevenue,
    currency,
    averageRevenuePerCustomer,
  };
}

async function fetchStripeRevenueMetricsSafe(): Promise<{
  monthlyRecurringRevenue: number;
  weeklyRevenue: number;
  currency: string;
  averageRevenuePerCustomer: number;
}> {
  try {
    const m = await fetchStripeRevenueMetrics();
    return {
      monthlyRecurringRevenue: m.monthlyRecurringRevenue,
      weeklyRevenue: m.weeklyRevenue,
      currency: m.currency,
      averageRevenuePerCustomer: m.averageRevenuePerCustomer,
    };
  } catch (err) {
    console.error("[admin-analytics] Stripe metrics failed:", err);
    return {
      monthlyRecurringRevenue: 0,
      weeklyRevenue: 0,
      currency: "usd",
      averageRevenuePerCustomer: 0,
    };
  }
}

export const adminAnalyticsService = {
  async getOverview(): Promise<AdminAnalyticsOverview> {
    const weekStart = daysAgo(7);
    const churnWindowDays = 30;
    const churnStart = daysAgo(churnWindowDays);

    const [
      totalUsers,
      weeklyActiveUsers,
      totalInactiveSubscribers,
      smartedgeActiveSubscribers,
      jonahActiveSubscribers,
      newSubscriptionsWeekly,
      churnedInWindow,
      activeSubscriptionsNow,
      stripeMetrics,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLoginAt: { $gte: weekStart } }),
      User.countDocuments({
        $and: [
          {
            $nor: [
              { "brandSubscriptions.smartedge.subscriptionStatus": { $in: [...ACTIVE_STATUSES] } },
              { "brandSubscriptions.jonah.subscriptionStatus": { $in: [...ACTIVE_STATUSES] } },
            ],
          },
          {
            $or: [
              { "brandSubscriptions.smartedge.stripeSubscriptionId": { $nin: [null, ""] } },
              { "brandSubscriptions.jonah.stripeSubscriptionId": { $nin: [null, ""] } },
            ],
          },
        ],
      }),
      User.countDocuments(activeBrandFilter("smartedge")),
      User.countDocuments(activeBrandFilter("jonah")),
      Subscription.countDocuments({ createdAt: { $gte: weekStart } }),
      Subscription.countDocuments({
        status: "canceled",
        $or: [
          { canceledAt: { $gte: churnStart } },
          { updatedAt: { $gte: churnStart }, canceledAt: { $exists: false } },
        ],
      }),
      Subscription.countDocuments({ status: { $in: [...ACTIVE_STATUSES] } }),
      fetchStripeRevenueMetricsSafe(),
    ]);

    const subscribersAtPeriodStart = Math.max(
      0,
      activeSubscriptionsNow + churnedInWindow - newSubscriptionsWeekly
    );
    const churnRatePercent =
      subscribersAtPeriodStart > 0
        ? Math.round((churnedInWindow / subscribersAtPeriodStart) * 1000) / 10
        : 0;

    return {
      weeklyActiveUsers,
      totalInactiveSubscribers,
      totalUsers,
      smartedgeActiveSubscribers,
      jonahActiveSubscribers,
      churnRatePercent,
      newSubscriptionsWeekly,
      averageRevenuePerCustomer: stripeMetrics.averageRevenuePerCustomer,
      currency: stripeMetrics.currency,
      monthlyRecurringRevenue: stripeMetrics.monthlyRecurringRevenue,
      weeklyRevenue: stripeMetrics.weeklyRevenue,
      generatedAt: new Date().toISOString(),
      period: {
        weeklyActiveFrom: weekStart.toISOString(),
        churnWindowDays,
        revenueWindowDays: 7,
      },
    };
  },
};
