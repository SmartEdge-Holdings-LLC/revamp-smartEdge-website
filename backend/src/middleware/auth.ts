import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";

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

    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
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
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
