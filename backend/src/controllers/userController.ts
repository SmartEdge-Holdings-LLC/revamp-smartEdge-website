import { Request, Response } from "express";
import { z } from "zod";
import { serializeMemberForClient } from "../lib/serializeUser";
import { User } from "../models/User";
import { userService } from "../services/userService";

const optionalTrimmed = z.string().trim().min(1).optional();

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  image: z.string().url().optional(),
  city: optionalTrimmed,
  country: optionalTrimmed,
  address: optionalTrimmed,
  state: optionalTrimmed,
  zip: optionalTrimmed,
  discordUsername: optionalTrimmed,
  phoneNumber: optionalTrimmed,
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const userController = {
  async getProfile(req: Request, res: Response) {
    return res.json({ user: await serializeMemberForClient(req.user!) });
  },
  async updateProfile(req: Request, res: Response) {
    try {
      const payload = updateProfileSchema.parse(req.body);
      const user = await User.findByIdAndUpdate(req.user!._id, payload, {
        new: true,
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({ user: await serializeMemberForClient(user) });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async updatePassword(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);
      const result = await userService.updateOwnPassword({
        userId,
        currentPassword,
        newPassword,
      });
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
};
