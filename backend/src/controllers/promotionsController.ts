import { Request, Response } from "express";
import { z } from "zod";
import { PROMOTION_STATUS } from "../models/Promotion";
import { promotionsService } from "../services/promotionsService";

const createPromotionSchema = z.object({
  code: z.string().min(3).max(40),
  description: z.string().min(1).max(500),
  discountPercent: z.coerce.number().int().min(1).max(100),
  maxRedemptions: z.coerce.number().int().min(1).nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  status: z.enum(PROMOTION_STATUS).default("active"),
  assignedUserIds: z.array(z.string()).optional(),
});

const updatePromotionSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  status: z.enum(PROMOTION_STATUS).optional(),
  assignedUserIds: z.array(z.string()).optional(),
});

function promotionIdParam(req: Request): string {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  return id ?? "";
}

export const promotionsController = {
  async list(_req: Request, res: Response) {
    try {
      const promotions = await promotionsService.findAll();
      return res.json({ promotions });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const promotion = await promotionsService.findById(promotionIdParam(req));
      return res.json({ promotion });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Promotion not found") return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = createPromotionSchema.parse(req.body);
      const adminId = req.admin?._id?.toString();
      if (!adminId) return res.status(401).json({ error: "Unauthorized" });

      const promotion = await promotionsService.create({
        ...payload,
        createdBy: adminId,
      });
      return res.status(201).json({ promotion });
    } catch (error) {
      const msg = (error as Error).message;
      return res.status(400).json({ error: msg });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const payload = updatePromotionSchema.parse(req.body);
      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }
      const promotion = await promotionsService.updateById(promotionIdParam(req), payload);
      return res.json({ promotion });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Promotion not found") return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const result = await promotionsService.deleteById(promotionIdParam(req));
      return res.json(result);
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Promotion not found") return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },
};
