import { Router } from "express";
import {
  getNflEvents,
  getNflOdds,
  getMlbEvents,
  getMlbOdds,
  getParlaySports,
} from "../controllers/parlayController";

const router = Router();

/** List active sports from Parlay API (0 credits). */
router.get("/sports", getParlaySports);

/** NFL game lines: moneyline, spreads, totals. Add ?format=html to view in browser. */
router.get("/nfl", getNflOdds);
router.get("/nfl/odds", getNflOdds);

/** NFL upcoming events (0 credits). */
router.get("/nfl/events", getNflEvents);

/** MLB game lines: moneyline, spreads, totals. Add ?format=html to view in browser. */
router.get("/mlb", getMlbOdds);
router.get("/mlb/odds", getMlbOdds);

/** MLB upcoming events (0 credits). */
router.get("/mlb/events", getMlbEvents);

export default router;
