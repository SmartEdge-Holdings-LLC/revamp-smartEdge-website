import { Router } from "express";
import { memberPicksController } from "../controllers/memberPicksController";
import { publicPicksController } from "../controllers/publicPicksController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/** Member paid picks (JWT + active subscription). Must be registered before `/:id`. */
router.get("/paid/admin", authMiddleware, memberPicksController.listAdminPaid);
router.get("/paid/jonah", authMiddleware, memberPicksController.listJonahPaid);

/** Public free picks for marketing site (no auth). */
router.get("/", publicPicksController.list);
router.get("/:id", publicPicksController.getOne);

export default router;

