import { Router } from "express";
import {
  getNflEvents,
  getNflOdds,
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

export default router;
