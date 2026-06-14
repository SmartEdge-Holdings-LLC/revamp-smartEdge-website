import { Subscription } from "../models/Subscription";
import { User } from "../models/User";
import {
  getJonahStripeScope,
  aggregateJonahPaidInvoicesByDay,
  computeJonahMrrFromActiveSubscribers,
  jonahActiveUserFilter,
  jonahUserFilter,
} from "./jonahStripeScope";

const ACTIVE_STATUSES = ["active", "trialing"] as const;

export type JonahAnalyticsOverview = {
  weeklyActiveUsers: number;
  totalInactiveSubscribers: number;
  totalUsers: number;
  activeSubscribers: number;
  churnRatePercent: number;
  newSubscriptionsWeekly: number;
  averageRevenuePerCustomer: number;
  currency: string;
  monthlyRecurringRevenue: number;
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

async function fetchJonahStripeRevenueMetrics(
  scope: Awaited<ReturnType<typeof getJonahStripeScope>>
): Promise<{
  monthlyRecurringRevenue: number;
  weeklyRevenue: number;
  currency: string;
  averageRevenuePerCustomer: number;
}> {
  const mrr = await computeJonahMrrFromActiveSubscribers(scope);

  const weekStart = Math.floor(daysAgo(7).getTime() / 1000);
  const weeklySales = await aggregateJonahPaidInvoicesByDay(weekStart, scope);

  const monthlyRecurringRevenue = mrr.monthlyRecurringCents / 100;
  const weeklyRevenue = weeklySales.totalCents / 100;
  const currency = weeklySales.currency || mrr.currency;
  const averageRevenuePerCustomer =
    mrr.activePayingCustomers > 0
      ? monthlyRecurringRevenue / mrr.activePayingCustomers
      : 0;

  return {
    monthlyRecurringRevenue,
    weeklyRevenue,
    currency,
    averageRevenuePerCustomer,
  };
}

export const jonahAnalyticsService = {
  async getOverview(): Promise<JonahAnalyticsOverview> {
    const weekStart = daysAgo(7);
    const churnWindowDays = 30;
    const churnStart = daysAgo(churnWindowDays);
    const scope = await getJonahStripeScope();

    let stripeMetrics = {
      monthlyRecurringRevenue: 0,
      weeklyRevenue: 0,
      currency: "usd",
      averageRevenuePerCustomer: 0,
    };

    try {
      stripeMetrics = await fetchJonahStripeRevenueMetrics(scope);
    } catch (err) {
      console.error("[jonah-analytics] Stripe metrics failed:", err);
    }

    const [
      totalUsers,
      weeklyActiveUsers,
      totalInactiveSubscribers,
      activeSubscribers,
      newJonahUserIds,
      churnedInWindow,
      activeJonahSubscriptionsNow,
    ] = await Promise.all([
      User.countDocuments(jonahUserFilter()),
      User.countDocuments({
        ...jonahUserFilter(),
        lastLoginAt: { $gte: weekStart },
      }),
      User.countDocuments({
        $and: [
          jonahUserFilter(),
          {
            $nor: [
              {
                "brandSubscriptions.jonah.subscriptionStatus": {
                  $in: [...ACTIVE_STATUSES],
                },
              },
            ],
          },
          { "brandSubscriptions.jonah.stripeSubscriptionId": { $nin: [null, ""] } },
        ],
      }),
      User.countDocuments(jonahActiveUserFilter()),
      Subscription.distinct("userId", {
        brand: "jonah",
        createdAt: { $gte: weekStart },
      }),
      Subscription.countDocuments({
        brand: "jonah",
        status: "canceled",
        $or: [
          { canceledAt: { $gte: churnStart } },
          { updatedAt: { $gte: churnStart }, canceledAt: { $exists: false } },
        ],
      }),
      Subscription.countDocuments({
        brand: "jonah",
        status: { $in: [...ACTIVE_STATUSES] },
      }),
    ]);

    const newSubscriptionsWeekly = newJonahUserIds.length;

    const subscribersAtPeriodStart = Math.max(
      0,
      activeJonahSubscriptionsNow + churnedInWindow - newSubscriptionsWeekly
    );
    const churnRatePercent =
      subscribersAtPeriodStart > 0
        ? Math.round((churnedInWindow / subscribersAtPeriodStart) * 1000) / 10
        : 0;

    return {
      weeklyActiveUsers,
      totalInactiveSubscribers,
      totalUsers,
      activeSubscribers,
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
