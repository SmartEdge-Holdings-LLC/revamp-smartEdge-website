import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { stripeService } from "../services/stripeService";
import { promotionsService } from "../services/promotionsService";
import { normalizeBrandSubscriptions } from "../lib/userBrandSubscriptions";
import { syncUserFromCheckoutSessionId } from "../services/stripeSubscriptionSync";
import { getMemberEntitlements } from "../services/subscriptionEntitlementsService";

const checkoutSchema = z
  .object({
    productId: z.string().min(1).optional(),
    brand: z.enum(["smartedge", "jonah"]).optional(),
    tier: z.enum(["weekly", "vip", "vip-premium"]).optional(),
    email: z.string().email().optional(),
    promotionCode: z.string().min(3).max(40).optional(),
    userId: z.string().optional(),
    pendingRegistration: z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      password: z.string().min(6),
    }).optional(),
  })
  .refine((body) => Boolean(body.productId) || (body.brand && body.tier), {
    message: "Provide productId or both brand and tier",
  });

export const stripeController = {
  async createCheckoutSession(req: Request, res: Response) {
    try {
      const body = checkoutSchema.parse(req.body);

      // For authenticated users, use their ID; for new registrations, pass undefined
      const userId = body.userId || req.user?._id?.toString();

      const session = await stripeService.createCheckoutSession(
        userId,
        body
      );
      return res.json({ url: session.url });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async syncCheckoutSession(req: Request, res: Response) {
    try {
      const { sessionId } = z.object({ sessionId: z.string().min(1) }).parse(req.body);

      // For authenticated users, use their ID; for new users, pass undefined
      const userId = req.user?._id?.toString();

      const user = await syncUserFromCheckoutSessionId(
        userId,
        sessionId
      );
      const entitlements = await getMemberEntitlements(user._id.toString());
      const fresh = await User.findById(user._id).lean();
      return res.json({
        subscription: {
          brandSubscriptions: fresh?.brandSubscriptions ?? {
            smartedge: null,
            jonah: null,
          },
          entitlements,
        },
      });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async createPortalSession(req: Request, res: Response) {
    try {
      const session = await stripeService.createPortalSession(
        req.user!._id.toString()
      );
      return res.json({ url: session.url });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async getSubscription(req: Request, res: Response) {
    const entitlements = await getMemberEntitlements(req.user!._id.toString());
    return res.json({
      subscription: {
        brandSubscriptions: normalizeBrandSubscriptions(req.user?.brandSubscriptions),
        entitlements,
      },
    });
  },
  async updatePaymentMethod(req: Request, res: Response) {
    try {
      const session = await stripeService.createPortalSession(
        req.user!._id.toString()
      );
      return res.json({ url: session.url });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async getPaymentMethods(req: Request, res: Response) {
    try {
      const result = await stripeService.listPaymentMethods(req.user!._id.toString());
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async getBillingHistory(req: Request, res: Response) {
    try {
      const result = await stripeService.listBillingHistory(req.user!._id.toString());
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async listMyPromotions(req: Request, res: Response) {
    try {
      const promotions = await promotionsService.listForUser(req.user!._id.toString());
      return res.json({ promotions });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async validatePromotionCode(req: Request, res: Response) {
    try {
      const { code } = z.object({ code: z.string().min(3).max(40) }).parse(req.body);
      const resolved = await promotionsService.resolvePromotionForCheckout(
        req.user!._id.toString(),
        code
      );
      const promotion = await promotionsService.findById(resolved.promotionId);
      return res.json({ valid: true, promotion });
    } catch (error) {
      return res.status(400).json({ valid: false, error: (error as Error).message });
    }
  },
};
