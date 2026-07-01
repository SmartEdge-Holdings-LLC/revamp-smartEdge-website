import { Request, Response } from "express";
import { z } from "zod";
import {
  hasJonahPaidAccess,
  hasSmartedgePaidAccess,
} from "../lib/subscriptionAccess";
import { LEAGUES, type PickAccess } from "../models/Pick";
import { picksService } from "../services/picksService";

/** Get the active subscription from an array of subscriptions */
function getActiveSubscription(subscriptions: any[]): any | null {
  if (!Array.isArray(subscriptions)) return null;
  return subscriptions.find((sub) => sub.subscriptionStatus === "active") || null;
}

/** Map Stripe plan names to access types for subscription tier comparison */
function mapPlanNameToAccessType(planName: string | null | undefined, brand: "jonah" | "smartedge" = "jonah"): string | null {
  if (!planName) return null;

  const normalized = planName.toLowerCase();

  if (brand === "jonah") {
    // Map Jonah Stripe plan names to API access types
    if (normalized.includes("monthlystandard") || (normalized.includes("vip") && !normalized.includes("monthlyvip"))) return "jonahvip";
    if (normalized.includes("monthlyvip") || normalized.includes("vippremium")) return "jonah-vip-premium";
  } else {
    // Map SmartEdge Stripe plan names to API access types
    if ((normalized.includes("vip") || normalized.includes("monthly")) && !normalized.includes("premium")) return "smartedgeVIP";
    if (normalized.includes("premium") || normalized.includes("vippremium")) return "smartedgeVIPPremium";
  }

  return null;
}

/** Check if user's tier grants access to required tier (higher tiers have access to lower tiers) */
function userTierGrantsAccess(userTier: string | null, requiredTiers: string[]): boolean {
  if (!userTier) return false;

  const tierHierarchy = {
    "smartedgeVIPPremium": 3,
    "jonah-vip-premium": 3,
    "smartedgeVIP": 2,
    "jonahvip": 2,
    "free": 1,
  };

  const userTierValue = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0;

  for (const requiredTier of requiredTiers) {
    const requiredTierValue = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 0;
    if (userTierValue >= requiredTierValue) {
      return true;
    }
  }

  return false;
}

const listPaidQuerySchema = z
  .object({
    page: z.union([z.string(), z.array(z.string())]).optional(),
    limit: z.union([z.string(), z.array(z.string())]).optional(),
    search: z.union([z.string(), z.array(z.string())]).optional(),
    league: z.union([z.string(), z.array(z.string())]).optional(),
    access: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .transform((o) => {
    const pageStr = Array.isArray(o.page) ? o.page[0] : o.page;
    const limitStr = Array.isArray(o.limit) ? o.limit[0] : o.limit;
    const searchStr = Array.isArray(o.search) ? o.search[0] : o.search;

    let page = parseInt(pageStr ?? "1", 10);
    if (!Number.isFinite(page) || page < 1) page = 1;
    let limit = parseInt(limitStr ?? "20", 10);
    if (!Number.isFinite(limit) || limit < 1) limit = 20;
    limit = Math.min(50, limit);

    const rawLeague = o.league;
    const leagueList: string[] = Array.isArray(rawLeague)
      ? rawLeague
      : typeof rawLeague === "string"
        ? rawLeague.split(",")
        : [];
    const league = Array.from(
      new Set(
        leagueList
          .map((s) => s.trim())
          .filter((s): s is (typeof LEAGUES)[number] =>
            (LEAGUES as readonly string[]).includes(s)
          )
      )
    );

    const rawAccess = o.access;
    const accessList: string[] = Array.isArray(rawAccess)
      ? rawAccess
      : typeof rawAccess === "string"
        ? rawAccess.split(",")
        : [];
    const access = Array.from(
      new Set(
        accessList
          .map((s) => s.trim())
          .filter((s) => ["free", "smartedgeVIP", "smartedgeVIPPremium", "jonahvip", "jonah-vip-premium", "tournament"].includes(s))
      )
    );

    return {
      page,
      limit,
      search: searchStr?.trim().slice(0, 200) || undefined,
      league: league.length > 0 ? league : undefined,
      access: access.length > 0 ? access : undefined,
    };
  });

export const memberPicksController = {
  /** Paid picks from SmartEdge admin desk (`admin` / `subadmin` authors). Requires member JWT. Full analysis only with SmartEdge VIP or Premium plan. */
  async listAdminPaid(req: Request, res: Response) {
    try {
      const user = req.user;
      const { page, limit, search, league, access } = listPaidQuerySchema.parse(req.query);

      // Determine what picks to fetch based on access parameter or user's subscription
      let paidAccess: PickAccess[] | undefined;

      if (access && access.length > 0) {
        // User explicitly requested specific access types
        paidAccess = access as PickAccess[];
      }

      const result = await picksService.findPaidPagedBySource({
        page,
        limit,
        search,
        league,
        ...(paidAccess ? { access: paidAccess } : {}),
        source: "admin",
      });

      // If user is not logged in, show preview without analysis
      if (!user) {
        return res.json({
          ...result,
          picks: result.picks.map((pick) => ({
            ...pick,
            detailedAnalysis: "Purchase the SmartEdge plan to view the pick",
          })),
        });
      }

      // User is logged in - check their subscription from brandSubscriptions
      const smartedgeSubs = Array.isArray(user.brandSubscriptions?.smartedge)
        ? user.brandSubscriptions.smartedge
        : [];
      const activeSubs = smartedgeSubs.filter(s => s && s.subscriptionStatus === "active");
      const rawUserPlanName = activeSubs.length > 0
        ? activeSubs.reduce((best, current) => {
            const tierMap = { "smartedgeVIPPremium": 3, "smartedgeVIP": 2, "free": 1 };
            const bestTier = tierMap[best.planName as keyof typeof tierMap] || 0;
            const currentTier = tierMap[current.planName as keyof typeof tierMap] || 0;
            return currentTier > bestTier ? current : best;
          }).planName
        : null;

      // Map plan name to access type (e.g., "Monthly VIP" → "smartedgevip")
      const userAccessType = mapPlanNameToAccessType(rawUserPlanName, "smartedge");

      // Filter and mask picks based on user's subscription and pick access level
      const processedPicks = result.picks.map((pick) => {
        const pickAccessArray = Array.isArray(pick.access) ? pick.access : [pick.access];

        // Check if user has access to this pick
        const hasAccess =
          pickAccessArray.includes("free") ||
          pickAccessArray.includes("tournament") ||
          userTierGrantsAccess(userAccessType, pickAccessArray as string[]);

        if (hasAccess) {
          return pick;
        }

        // Determine which plan to recommend based on access requirements
        let lockedMessage = "Purchase the SmartEdge plan to view the pick";
        if (pickAccessArray.includes("smartedgeVIPPremium")) {
          lockedMessage = "Purchase the SmartEdge Premium plan to view this pick";
        } else if (pickAccessArray.includes("smartedgeVIP")) {
          lockedMessage = "Purchase the SmartEdge VIP plan to view this pick";
        } else if (pickAccessArray.some((a) => a.includes("jonah"))) {
          lockedMessage = "Purchase Jonah's Monthly VIP plan to view this pick";
        }

        return {
          ...pick,
          pickTitle: "Premium Pick - Upgrade to view",
          detailedAnalysis: lockedMessage,
          odds: "Locked",
          confidence: 0,
          result: pick.result,
        };
      });

      return res.json({
        ...result,
        picks: processedPicks,
      });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  /** Paid picks from Jonah handicapper. Requires member JWT. Access control based on Jonah plan. */
  async listJonahPaid(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { page, limit, search, league, access } = listPaidQuerySchema.parse(req.query);

      // Determine what picks to fetch based on access parameter
      let paidAccess: PickAccess[] | undefined;

      if (access && access.length > 0) {
        // User explicitly requested specific access types
        paidAccess = access as PickAccess[];
      }

      const result = await picksService.findPaidPagedBySource({
        page,
        limit,
        search,
        league,
        ...(paidAccess ? { access: paidAccess } : {}),
        source: "jonah",
      });

      // User is logged in - check their subscription from brandSubscriptions
      const jonahSubs = Array.isArray(user.brandSubscriptions?.jonah)
        ? user.brandSubscriptions.jonah
        : [];
      const activeSubs = jonahSubs.filter(s => s && s.subscriptionStatus === "active");
      const rawUserPlanName = activeSubs.length > 0
        ? activeSubs.reduce((best, current) => {
            const tierMap = { "jonah-vip-premium": 3, "jonahvip": 2, "free": 1 };
            const bestTier = tierMap[best.planName as keyof typeof tierMap] || 0;
            const currentTier = tierMap[current.planName as keyof typeof tierMap] || 0;
            return currentTier > bestTier ? current : best;
          }).planName
        : null;

      // Map plan name to access type (e.g., "jonahMonthlyStandard" → "jonahvip")
      const userAccessType = mapPlanNameToAccessType(rawUserPlanName);

      // Filter and mask picks based on user's subscription and pick access level
      const processedPicks = result.picks.map((pick) => {
        const pickAccessArray = Array.isArray(pick.access) ? pick.access : [pick.access];

        // Check if user has access to this pick
        const hasAccess =
          pickAccessArray.includes("free") ||
          pickAccessArray.includes("tournament") ||
          userTierGrantsAccess(userAccessType, pickAccessArray as string[]);

        if (hasAccess) {
          return pick;
        }

        // Determine which plan to recommend based on access requirements
        let lockedMessage = "Purchase a Jonah plan to view this pick";
        if (pickAccessArray.includes("jonah-vip-premium")) {
          lockedMessage = "Purchase Jonah's Monthly VIP plan to view this pick";
        } else if (pickAccessArray.includes("jonahvip")) {
          lockedMessage = "Purchase Jonah's Monthly Standard plan to view this pick";
        }

        return {
          ...pick,
          pickTitle: "Premium Pick - Upgrade to view",
          detailedAnalysis: lockedMessage,
          odds: "Locked",
          confidence: 0,
          result: pick.result,
        };
      });

      return res.json({
        ...result,
        picks: processedPicks,
      });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
};
