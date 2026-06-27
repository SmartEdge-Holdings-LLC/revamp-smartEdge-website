import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";
import { Admin } from "../models/Admin";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, env.jwtSecret) as { userId?: string; adminId?: string };

    // Try to load admin first (if adminId in token)
    if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId);
      if (!admin) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      req.admin = admin;
      req.tokenPayload = decoded;
      return next();
    }

    // Fall back to user (if userId in token)
    if (decoded.userId) {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const now = new Date();
      const last = user.lastLoginAt?.getTime() ?? 0;
      if (now.getTime() - last > 15 * 60 * 1000) {
        void User.updateOne({ _id: user._id }, { lastLoginAt: now });
        user.lastLoginAt = now;
      }

      req.user = user;
      req.tokenPayload = decoded;
      return next();
    }

    return res.status(401).json({ error: "Unauthorized" });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
