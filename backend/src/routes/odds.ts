import { Router } from "express";
import { oddsController } from "../controllers/oddsController";
import { cacheMiddleware } from "../middleware/cacheMiddleware";

const router = Router();

/** Get baseball MLB odds from The Odds API - cached for 10 minutes to save API quota */
router.get("/baseball-mlb", cacheMiddleware(600), oddsController.getBaseballMlbOdds);

/** Get historical baseball MLB odds from The Odds API - cached for 24 hours (never changes) */
router.get("/baseball-mlb/historical", cacheMiddleware(86400), oddsController.getHistoricalBaseballMlbOdds);

/** Get event-specific odds for a MLB game - cached for 10 minutes */
router.get("/event/:eventId", cacheMiddleware(600), oddsController.getEventOdds);

/** Get game details with standard markets (h2h, spreads, totals) - cached for 10 minutes */
router.get("/game/:gameId", cacheMiddleware(600), oddsController.getGameDetails);

export default router;
