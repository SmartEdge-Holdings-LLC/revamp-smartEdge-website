import { Router } from "express";
import { publicVideosController } from "../controllers/publicVideosController";

const router = Router();

/** Public videos — active only, no auth (contrast with GET /api/admin/videos). */
router.get("/", publicVideosController.list);
router.get("/:id", publicVideosController.getOne);

export default router;
