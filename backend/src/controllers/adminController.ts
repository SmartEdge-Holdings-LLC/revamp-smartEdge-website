import { Request, Response } from "express";
import { z } from "zod";
import { adminService } from "../services/adminService";
import { jonahUsersService } from "../services/jonahUsersService";
import { adminAnalyticsService } from "../services/adminAnalyticsService";
import { adminStripeSalesService } from "../services/adminStripeSalesService";
import { smsService } from "../services/smsService";
import { userService } from "../services/userService";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

const updateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["admin", "subadmin"]).optional(),
});

const ALLOWED_STATUS = [
  "active",
  "inactive",
  "trialing",
  "past_due",
  "canceled",
  "unpaid",
] as const;

/**
 * Parse a date filter string. Accepts:
 *   - `YYYY-MM-DD` (interpreted as UTC midnight; for `endOfDay`, returns 23:59:59.999 UTC)
 *   - Any full ISO-8601 string accepted by `new Date(...)`.
 * Returns `undefined` for missing / invalid input so we silently ignore it.
 */
function parseDateParam(
  value: string | string[] | undefined,
  endOfDay = false
): Date | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  // Plain YYYY-MM-DD → interpret in UTC explicitly so behaviour is timezone-independent.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

const listUsersQuerySchema = z.object({
  page: z.union([z.string(), z.array(z.string())]).optional(),
  limit: z.union([z.string(), z.array(z.string())]).optional(),
  search: z.union([z.string(), z.array(z.string())]).optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  joinedFrom: z.union([z.string(), z.array(z.string())]).optional(),
  joinedTo: z.union([z.string(), z.array(z.string())]).optional(),
}).transform((o) => {
  const pageStr = Array.isArray(o.page) ? o.page[0] : o.page;
  const limitStr = Array.isArray(o.limit) ? o.limit[0] : o.limit;
  const searchStr = Array.isArray(o.search) ? o.search[0] : o.search;
  let page = parseInt(pageStr ?? "1", 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  let limit = parseInt(limitStr ?? "20", 10);
  if (!Number.isFinite(limit) || limit < 1) limit = 20;
  limit = Math.min(100, limit);
  const search = searchStr?.trim().slice(0, 200) || undefined;

  const rawStatus = o.status;
  const statusList: string[] = Array.isArray(rawStatus)
    ? rawStatus
    : typeof rawStatus === "string"
      ? rawStatus.split(",")
      : [];
  const status = Array.from(
    new Set(
      statusList
        .map((s) => s.trim())
        .filter((s): s is (typeof ALLOWED_STATUS)[number] =>
          (ALLOWED_STATUS as readonly string[]).includes(s)
        )
    )
  );

  let joinedFrom = parseDateParam(o.joinedFrom, false);
  let joinedTo = parseDateParam(o.joinedTo, true);
  // If the caller passed them inverted, swap so we still return useful results.
  if (joinedFrom && joinedTo && joinedFrom.getTime() > joinedTo.getTime()) {
    [joinedFrom, joinedTo] = [joinedTo, joinedFrom];
  }

  return {
    page,
    limit,
    search,
    status: status.length > 0 ? status : undefined,
    joinedFrom,
    joinedTo,
  };
});

const sendTestSmsSchema = z.object({
  phoneNumber: z.string().min(7),
  message: z.string().min(1).max(1000).optional(),
});

const sendBulkSmsSchema = z.object({
  message: z.string().min(1).max(1000).optional(),
  delayMs: z.number().int().min(500).max(10000).optional(),
});

const updateOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const adminController = {
  async profile(req: Request, res: Response) {
    try {
      const adminId = req.admin?._id?.toString();
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const admin = await adminService.findByIdSafe(adminId);
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
      return res.json({ admin });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = createSchema.parse(req.body);
      const admin = await adminService.create({
        ...payload,
        role: "subadmin",
      });
      return res.status(201).json({ admin });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async list(_req: Request, res: Response) {
    try {
      const admins = await adminService.findAll();
      return res.json({ admins });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  },

  async listJonahUsers(req: Request, res: Response) {
    try {
      const { page, limit, search, status, joinedFrom, joinedTo } =
        listUsersQuerySchema.parse(req.query);
      const result = await jonahUsersService.findSubscribers({
        page,
        limit,
        search,
        status,
        joinedFrom,
        joinedTo,
      });
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async getAnalytics(_req: Request, res: Response) {
    try {
      const analytics = await adminAnalyticsService.getOverview();
      return res.json({ analytics });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  },

  async getSalesByDay(req: Request, res: Response) {
    try {
      const result = await adminStripeSalesService.getSalesByDay(req.query.range);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  },

  async listUsers(req: Request, res: Response) {
    try {
      const { page, limit, search, status, joinedFrom, joinedTo } =
        listUsersQuerySchema.parse(req.query);
      const result = await userService.findPagedForAdmin({
        page,
        limit,
        search,
        status,
        joinedFrom,
        joinedTo,
      });
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const payload = updateSchema.parse(req.body);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const admin = await adminService.updateById(id, payload);
      return res.json({ admin });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Admin not found") return res.status(404).json({ error: msg });
      if (msg === "Invalid admin id") return res.status(400).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await adminService.deleteById(id);
      return res.json(result);
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Admin not found") return res.status(404).json({ error: msg });
      if (msg === "Invalid admin id") return res.status(400).json({ error: msg });
      if (msg.includes("last admin")) return res.status(400).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async sendTestSms(req: Request, res: Response) {
    try {
      const payload = sendTestSmsSchema.parse(req.body);
      const result = await smsService.sendSingle({
        to: payload.phoneNumber,
        text: payload.message,
      });
      return res.json({
        success: true,
        to: result.to,
        messageId: result.messageId,
        message:
          payload.message?.trim() || smsService.getDefaultMessage(),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to send test SMS";
      return res.status(400).json({ error: msg });
    }
  },

  async sendBulkSms(req: Request, res: Response) {
    try {
      const payload = sendBulkSmsSchema.parse(req.body ?? {});
      const result = await smsService.sendToAllUsers({
        text: payload.message,
        delayMs: payload.delayMs,
      });
      return res.json({
        success: true,
        message:
          payload.message?.trim() || smsService.getDefaultMessage(),
        delayMs: payload.delayMs ?? undefined,
        ...result,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to send bulk SMS";
      return res.status(400).json({ error: msg });
    }
  },

  async updateOwnPassword(req: Request, res: Response) {
    try {
      const adminId = req.admin?._id?.toString();
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { currentPassword, newPassword } = updateOwnPasswordSchema.parse(req.body);
      const result = await adminService.updateOwnPassword({
        adminId,
        currentPassword,
        newPassword,
      });
      return res.json(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update password";
      return res.status(400).json({ error: msg });
    }
  },
};
