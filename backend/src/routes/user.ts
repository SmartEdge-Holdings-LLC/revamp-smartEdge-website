import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.post("/password/update", authMiddleware, userController.updatePassword);

export default router;
