import { Router } from "express";
import { oddsController } from "../controllers/oddsController";

const router = Router();

/** Get baseball MLB odds from The Odds API */
router.get("/baseball-mlb", oddsController.getBaseballMlbOdds);

/** Get historical baseball MLB odds from The Odds API */
router.get("/baseball-mlb/historical", oddsController.getHistoricalBaseballMlbOdds);

export default router;
