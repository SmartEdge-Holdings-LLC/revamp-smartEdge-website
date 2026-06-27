import { Request, Response } from "express";
import { z } from "zod";
import { News } from "../models/News";

const createNewsSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  cta: z.string().url().max(500).optional(),
});

const updateNewsSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  cta: z.string().url().max(500).optional().or(z.literal("")),
});

export const newsController = {
  async list(req: Request, res: Response) {
    try {
      const news = await News.find()
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
      return res.json({ news });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async getActive(req: Request, res: Response) {
    try {
      const activeNews = await News.findOne({ isActive: true }).populate(
        "createdBy",
        "name email role"
      );
      return res.json({ news: activeNews || null });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const news = await News.findById(id).populate("createdBy", "name email role");
      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }
      return res.json({ news });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = createNewsSchema.parse(req.body);
      const adminId = req.admin?._id?.toString();
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const news = new News({
        ...payload,
        createdBy: adminId,
      });

      await news.save();
      await news.populate("createdBy", "name email role");

      return res.status(201).json({ news });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payload = updateNewsSchema.parse(req.body);

      const news = await News.findByIdAndUpdate(id, payload, { new: true }).populate(
        "createdBy",
        "name email role"
      );

      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }

      return res.json({ news });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const news = await News.findByIdAndDelete(id);

      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }

      return res.json({ message: "News deleted successfully" });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async activate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminId = req.admin?._id?.toString();
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Deactivate all other news items
      await News.updateMany({ _id: { $ne: id } }, { isActive: false });

      // Activate the selected news item
      const news = await News.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true }
      ).populate("createdBy", "name email role");

      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }

      return res.json({ news, message: "News activated successfully" });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
};
