import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Admin } from "../models/Admin";

/** JWT must include `adminId` (from `POST /api/auth/login` when resolved as an `Admin`), not `userId`. */
export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, env.jwtSecret) as { adminId?: string; userId?: string };
    if (decoded.userId || typeof decoded.adminId !== "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.admin = admin;
    req.adminTokenPayload = { adminId: decoded.adminId };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
