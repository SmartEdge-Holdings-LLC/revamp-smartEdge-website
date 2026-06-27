import { Router } from "express";
import { newsController } from "../controllers/newsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/** Public endpoint - read news */
router.get("/", newsController.list);
router.get("/active/current", newsController.getActive);
router.get("/:id", newsController.getOne);

/** Admin only - CRUD */
router.post("/", authMiddleware, newsController.create);
router.patch("/:id", authMiddleware, newsController.update);
router.delete("/:id", authMiddleware, newsController.delete);
router.post("/:id/activate", authMiddleware, newsController.activate);

export default router;
