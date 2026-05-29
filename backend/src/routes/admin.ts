import { Router } from "express";
import { adminController } from "../controllers/adminController";
import { picksController } from "../controllers/picksController";
import { videosController } from "../controllers/videosController";
import { adminAuthMiddleware } from "../middleware/adminAuth";
import {
  requireAdminJwt,
  requireHandicapperAccess,
  requireSubadmin,
  requireTopAdmin,
} from "../middleware/requireAdmin";

const router = Router();

router.use(adminAuthMiddleware);
router.get("/profile", requireHandicapperAccess, adminController.profile);
router.get("/analytics", requireAdminJwt, adminController.getAnalytics);
router.get("/analytics/sales", requireAdminJwt, adminController.getSalesByDay);
router.get("/users", requireAdminJwt, adminController.listUsers);
router.get("/jonah-users", requireHandicapperAccess, adminController.listJonahUsers);
router.post("/password/update", requireHandicapperAccess, adminController.updateOwnPassword);
router.post("/sms/test", requireAdminJwt, adminController.sendTestSms);
router.post("/sms/broadcast", requireAdminJwt, adminController.sendBulkSms);
router.post("/admins", requireTopAdmin, adminController.create);
router.get("/admins", requireAdminJwt, adminController.list);
router.put("/admins/:id", requireSubadmin, adminController.update);
router.delete("/admins/:id", requireSubadmin, adminController.remove);

router.get("/league-teams", requireHandicapperAccess, picksController.listTeams);
router.get("/picks", requireHandicapperAccess, picksController.list);
router.get("/picks/:id", requireHandicapperAccess, picksController.getOne);
router.post("/picks", requireHandicapperAccess, picksController.create);
router.put("/picks/:id", requireHandicapperAccess, picksController.update);
router.delete("/picks/:id", requireHandicapperAccess, picksController.remove);

router.get("/videos", requireAdminJwt, videosController.list);
router.get("/videos/:id", requireAdminJwt, videosController.getOne);
router.post("/videos", requireAdminJwt, videosController.create);
router.put("/videos/:id", requireAdminJwt, videosController.update);
router.delete("/videos/:id", requireAdminJwt, videosController.remove);

export default router;
