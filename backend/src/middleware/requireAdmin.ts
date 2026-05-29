import { NextFunction, Request, Response } from "express";

/** Full admin console: `admin` or `subadmin` only (not `handicapper`). */
export const requireAdminJwt = (req: Request, res: Response, next: NextFunction) => {
  const role = req.admin?.role;
  if (!req.admin || (role !== "admin" && role !== "subadmin")) {
    return res.status(403).json({ error: "Forbidden: Admin JWT required (role admin or subadmin)" });
  }
  return next();
};

/** Jonah handicapper routes: any `Admin` role including `handicapper`. */
export const requireHandicapperAccess = (req: Request, res: Response, next: NextFunction) => {
  const role = req.admin?.role;
  if (!req.admin || (role !== "admin" && role !== "subadmin" && role !== "handicapper")) {
    return res.status(403).json({
      error: "Forbidden: Admin JWT required (role admin, subadmin, or handicapper)",
    });
  }
  return next();
};

/** Update/delete `Admin` rows: `subadmin` only (not top `admin`). */
export const requireSubadmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.admin?.role !== "subadmin") {
    return res.status(403).json({ error: "Forbidden: subadmin role required" });
  }
  return next();
};

/** Create sub-admins: top `admin` only. */
export const requireTopAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.admin?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: admin role required" });
  }
  return next();
};
