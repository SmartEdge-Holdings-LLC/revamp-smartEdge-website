import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  return res.status(500).json({
    error: error.message || "Internal Server Error",
  });
};
