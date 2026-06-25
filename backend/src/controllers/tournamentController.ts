import { Request, Response } from "express";
import { z } from "zod";
import { TOURNAMENT_STATUS, PRIZE_TYPES } from "../models/Tournament";
import { tournamentService } from "../services/tournamentService";

const prizeSchema = z.object({
  type: z.enum(PRIZE_TYPES),
  value: z.coerce.number().min(0),
  description: z.string().max(500).optional(),
});

const createTournamentSchema = z.object({
  name: z.string().min(1).max(200),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(TOURNAMENT_STATUS).default("inactive"),
  gameIds: z.array(z.string()).optional(),
  prize: prizeSchema,
});

const updateTournamentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  status: z.enum(TOURNAMENT_STATUS).optional(),
  gameIds: z.array(z.string()).optional(),
  prize: prizeSchema.optional(),
});

function idParam(req: Request): string {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  return id ?? "";
}

function entryIdParam(req: Request): string {
  const id = Array.isArray(req.params.entryId)
    ? req.params.entryId[0]
    : req.params.entryId;
  return id ?? "";
}

export const tournamentController = {
  async list(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const validStatus =
        status && TOURNAMENT_STATUS.includes(status as any)
          ? (status as any)
          : undefined;
      const tournaments = await tournamentService.findAll(validStatus);
      return res.json({ tournaments });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const tournament = await tournamentService.findById(idParam(req));
      return res.json({ tournament });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Tournament not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = createTournamentSchema.parse(req.body);
      const adminId = req.admin?._id?.toString();
      if (!adminId) return res.status(401).json({ error: "Unauthorized" });

      const tournament = await tournamentService.create({
        ...payload,
        createdBy: adminId,
      });
      return res.status(201).json({ tournament });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const payload = updateTournamentSchema.parse(req.body);
      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }
      const tournament = await tournamentService.updateById(
        idParam(req),
        payload
      );
      return res.json({ tournament });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Tournament not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const result = await tournamentService.deleteById(idParam(req));
      return res.json(result);
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Tournament not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async leaderboard(req: Request, res: Response) {
    try {
      const entries = await tournamentService.getLeaderboard(idParam(req));
      return res.json({ entries });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Tournament not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async addEntry(req: Request, res: Response) {
    try {
      const { memberId } = req.body;
      if (!memberId) return res.status(400).json({ error: "memberId required" });
      const entry = await tournamentService.addEntry(idParam(req), memberId);
      return res.status(201).json({ entry });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Tournament not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async updateEntryPicks(req: Request, res: Response) {
    try {
      const { picks } = req.body;
      if (!Array.isArray(picks))
        return res.status(400).json({ error: "picks must be an array" });
      const entry = await tournamentService.updateEntryPicks(
        idParam(req),
        entryIdParam(req),
        picks
      );
      return res.json({ entry });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Entry not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async markPrizeClaimed(req: Request, res: Response) {
    try {
      const { memberId } = req.body;
      if (!memberId) return res.status(400).json({ error: "memberId required" });
      const result = await tournamentService.markPrizeClaimed(
        idParam(req),
        memberId
      );
      return res.json(result);
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Entry not found")
        return res.status(404).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },
};
