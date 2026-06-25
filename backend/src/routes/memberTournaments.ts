import { Router } from "express";
import { memberTournamentController } from "../controllers/memberTournamentController";
import { authMiddleware } from "../middleware/auth";

const tournamentBrowseRouter = Router();
tournamentBrowseRouter.use(authMiddleware);
tournamentBrowseRouter.get("/", memberTournamentController.listActive);
tournamentBrowseRouter.get("/:id", memberTournamentController.getOne);
tournamentBrowseRouter.get("/:id/leaderboard", memberTournamentController.getLeaderboard);

const tournamentMemberRouter = Router();
tournamentMemberRouter.use(authMiddleware);
tournamentMemberRouter.get("/", memberTournamentController.getMyEntries);
tournamentMemberRouter.post("/:id/join", memberTournamentController.joinTournament);
tournamentMemberRouter.get("/:id/my-entry", memberTournamentController.getMyEntry);
tournamentMemberRouter.put("/:id/my-picks", memberTournamentController.submitPicks);

export { tournamentBrowseRouter, tournamentMemberRouter };
