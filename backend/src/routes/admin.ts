import { Router } from "express";
import { adminController } from "../controllers/adminController";
import { picksController } from "../controllers/picksController";
import { videosController } from "../controllers/videosController";
import { promotionsController } from "../controllers/promotionsController";
import { tournamentController } from "../controllers/tournamentController";
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
router.delete("/users/:id", requireAdminJwt, adminController.deleteUser);
router.get("/jonah-users", requireHandicapperAccess, adminController.listJonahUsers);
router.get("/jonah/analytics", requireHandicapperAccess, adminController.getJonahAnalytics);
router.get("/jonah/analytics/sales", requireHandicapperAccess, adminController.getJonahSalesByDay);
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

router.get("/promotions", requireAdminJwt, promotionsController.list);
router.get("/promotions/:id", requireAdminJwt, promotionsController.getOne);
router.post("/promotions", requireAdminJwt, promotionsController.create);
router.put("/promotions/:id", requireAdminJwt, promotionsController.update);
router.delete("/promotions/:id", requireAdminJwt, promotionsController.remove);

router.get("/tournaments", requireAdminJwt, tournamentController.list);
router.get("/tournaments/:id", requireAdminJwt, tournamentController.getOne);
router.post("/tournaments", requireAdminJwt, tournamentController.create);
router.put("/tournaments/:id", requireAdminJwt, tournamentController.update);
router.delete("/tournaments/:id", requireAdminJwt, tournamentController.remove);
router.get("/tournaments/:id/leaderboard", requireAdminJwt, tournamentController.leaderboard);
router.post("/tournaments/:id/entries", requireAdminJwt, tournamentController.addEntry);
router.put("/tournaments/:id/entries/:entryId/picks", requireAdminJwt, tournamentController.updateEntryPicks);
router.post("/tournaments/:id/mark-prize-claimed", requireAdminJwt, tournamentController.markPrizeClaimed);

export default router;
