import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Try again later." },
});

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", passwordResetLimiter, authController.forgotPassword);
router.post("/verify-reset-code", passwordResetLimiter, authController.verifyResetCode);
router.post("/reset-password", passwordResetLimiter, authController.resetPassword);
router.get("/me", authMiddleware, authController.me);

export default router;
