import { Request, Response } from "express";
import { z } from "zod";
import { tournamentService } from "../services/tournamentService";

const submitPicksSchema = z.object({
  picks: z.array(z.string().min(1)).min(1).max(50),
});

function idParam(req: Request): string {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  return id ?? "";
}

function memberId(req: Request): string {
  return req.user!._id.toString();
}

export const memberTournamentController = {
  async listActive(_req: Request, res: Response) {
    try {
      const tournaments = await tournamentService.findActiveTournaments();
      return res.json({ tournaments });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const tournament = await tournamentService.findByIdWithGames(idParam(req));
      if (tournament.status === "inactive") {
        return res.status(404).json({ error: "Tournament not found" });
      }
      return res.json({ tournament });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Tournament not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async getLeaderboard(req: Request, res: Response) {
    try {
      const tournament = await tournamentService.findById(idParam(req));
      if (tournament.status === "inactive") {
        return res.status(404).json({ error: "Tournament not found" });
      }
      const entries = await tournamentService.getLeaderboard(idParam(req));
      const sanitized = entries.map(({ memberEmail, ...rest }) => rest);
      return res.json({ entries: sanitized });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Tournament not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async getMyEntries(req: Request, res: Response) {
    try {
      const entries = await tournamentService.findMyEntries(memberId(req));
      return res.json({ entries });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async joinTournament(req: Request, res: Response) {
    try {
      const entry = await tournamentService.addEntry(
        idParam(req),
        memberId(req)
      );
      return res.status(201).json({
        entry: {
          id: entry._id.toString(),
          tournamentId: entry.tournamentId.toString(),
          status: "joined",
        },
      });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Tournament not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async getMyEntry(req: Request, res: Response) {
    try {
      const entry = await tournamentService.findMyEntry(
        idParam(req),
        memberId(req)
      );
      return res.json({ entry });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async submitPicks(req: Request, res: Response) {
    try {
      const { picks } = submitPicksSchema.parse(req.body);
      const result = await tournamentService.submitMyPicks(
        idParam(req),
        memberId(req),
        picks
      );
      return res.json({ entry: result });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Tournament not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },
};
