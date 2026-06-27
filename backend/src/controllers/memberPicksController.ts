import { Request, Response } from "express";
import { z } from "zod";
import {
  hasJonahPaidAccess,
  hasSmartedgePaidAccess,
} from "../lib/subscriptionAccess";
import { getMemberEntitlements } from "../services/subscriptionEntitlementsService";
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
    if (normalized.includes("weekly")) return "jonahweekly";
    if (normalized.includes("monthlystandard") || (normalized.includes("vip") && !normalized.includes("monthlyvip"))) return "jonahvip";
    if (normalized.includes("monthlyvip") || normalized.includes("vippremium")) return "jonah-vip-premium";
  } else {
    // Map SmartEdge Stripe plan names to API access types
    if ((normalized.includes("vip") || normalized.includes("monthly")) && !normalized.includes("premium")) return "smartedgeVIP";
    if (normalized.includes("premium") || normalized.includes("vippremium")) return "smartedgeVIPPremium";
  }

  return null;
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
          .filter((s) => ["free", "smartedgeVIP", "smartedgeVIPPremium", "jonahweekly", "jonahvip", "jonah-vip-premium", "tournament"].includes(s))
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

      // User is logged in - check their subscription
      const entitlements = await getMemberEntitlements(user._id.toString());
      // Fallback to user's brandSubscriptions if entitlements not found
      const activeSub = getActiveSubscription(user.brandSubscriptions?.smartedge);
      const rawUserPlanName = entitlements.smartedge?.active
        ? entitlements.smartedge.planName
        : (activeSub?.planName || null);

      // Map plan name to access type (e.g., "Monthly VIP" → "smartedgevip")
      const userAccessType = mapPlanNameToAccessType(rawUserPlanName, "smartedge");

      // Filter and mask picks based on user's subscription and pick access level
      const processedPicks = result.picks.map((pick) => {
        const pickAccess = pick.access as PickAccess;
        switch (pickAccess) {
          case "free":
            // All users can see free picks
            return pick;

          case "smartedgeVIP":
            // Only smartedgeVIP users can see smartedgeVIP picks
            if (userAccessType === "smartedgeVIP") {
              return pick;
            }
            return {
              ...pick,
              pickTitle: "Premium Pick - Upgrade to view",
              detailedAnalysis: "Purchase the SmartEdge VIP plan to view this pick",
              odds: "Locked",
              confidence: 0,
            };

          case "smartedgeVIPPremium":
            // Only smartedgeVIPPremium users can see smartedgeVIPPremium picks
            if (userAccessType === "smartedgeVIPPremium") {
              return pick;
            }
            return {
              ...pick,
              pickTitle: "Premium Pick - Upgrade to view",
              detailedAnalysis: "Purchase the SmartEdge Premium plan to view this pick",
              odds: "Locked",
              confidence: 0,
            };

          case "jonahweekly":
          case "jonahvip":
          case "jonah-vip-premium":
            // Jonah picks should not appear in SmartEdge endpoint, but if they do, mask them
            return {
              ...pick,
              pickTitle: "Premium Pick - Upgrade to view",
              detailedAnalysis: "Purchase Jonah's Monthly VIP plan to view this pick",
              odds: "Locked",
              confidence: 0,
            };

          case "tournament":
            // Tournament picks - shown as is (access control handled elsewhere)
            return pick;

          default:
            // Default case - show purchase message
            return {
              ...pick,
              pickTitle: "Premium Pick - Upgrade to view",
              detailedAnalysis: "Purchase the SmartEdge plan to view the pick",
              odds: "Locked",
              confidence: 0,
            };
        }
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

      // User is logged in - check their subscription
      const entitlements = await getMemberEntitlements(user._id.toString());
      // Fallback to user's brandSubscriptions if entitlements not found
      const activeSub = getActiveSubscription(user.brandSubscriptions?.jonah);
      const rawUserPlanName = entitlements.jonah?.active
        ? entitlements.jonah.planName
        : (activeSub?.planName || null);

      // Map plan name to access type (e.g., "jonahMonthlyStandard" → "jonahvip")
      const userAccessType = mapPlanNameToAccessType(rawUserPlanName);

      // Filter and mask picks based on user's subscription and pick access level
      const processedPicks = result.picks.map((pick) => {
        const pickAccess = pick.access as PickAccess;
        switch (pickAccess) {
          case "free":
            // All users can see free picks
            return pick;

          case "jonahweekly":
            // Only jonahweekly users can see jonahweekly picks
            if (userAccessType === "jonahweekly") {
              return pick;
            }
            return {
              ...pick,
              pickTitle: "Premium Pick - Upgrade to view",
              detailedAnalysis: "Purchase Jonah's Weekly plan to view this pick",
              odds: "Locked",
              confidence: 0,
            };

          case "jonahvip":
            // Only jonahvip users can see jonahvip picks
            if (userAccessType === "jonahvip") {
              return pick;
            }
            return {
              ...pick,
              pickTitle: "Premium Pick - Upgrade to view",
              detailedAnalysis: "Purchase Jonah's Monthly Standard plan to view this pick",
              odds: "Locked",
              confidence: 0,
            };

          case "jonah-vip-premium":
            // Only jonah-vip-premium users can see jonah-vip-premium picks
            if (userAccessType === "jonah-vip-premium") {
              return pick;
            }
            return {
              ...pick,
              pickTitle: "Premium Pick - Upgrade to view",
              detailedAnalysis: "Purchase Jonah's Monthly VIP plan to view this pick",
              odds: "Locked",
              confidence: 0,
            };

          case "tournament":
            // Tournament picks - shown as is (access control handled elsewhere)
            return pick;

          default:
            // Default case - show purchase message
            return {
              ...pick,
              pickTitle: "Premium Pick - Upgrade to view",
              detailedAnalysis: "Purchase a Jonah plan to view this pick",
              odds: "Locked",
              confidence: 0,
            };
        }
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
