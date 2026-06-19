import * as plivo from "plivo";
import { env } from "../config/env";
import { User } from "../models/User";

const PICKS_LIVE_MESSAGE =
  "Picks are now live on the site. Please log in to your dashboard to view them: https://smartedgepicks.com/";

type BulkSmsResult = {
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  failures: Array<{ phoneNumber: string; error: string }>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizePhoneNumber(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Keep + and digits only; Plivo expects E.164.
  const normalized = trimmed.replace(/[^\d+]/g, "");
  return normalized || null;
}

function getClient() {
  if (!env.plivoAuthId) {
    throw new Error("PLIVO_AUTH_ID is not configured");
  }
  if (!env.plivoAuthToken) {
    throw new Error("PLIVO_AUTH_TOKEN is not configured");
  }
  if (!env.plivoFromNumber) {
    throw new Error(
      "PLIVO_FROM_NUMBER is not configured. Set your Plivo SMS number in E.164 format (e.g. +12064797227)."
    );
  }
  return new plivo.Client(env.plivoAuthId, env.plivoAuthToken);
}

export const smsService = {
  getDefaultMessage(): string {
    return PICKS_LIVE_MESSAGE;
  },

  async sendSingle(params: { to: string; text?: string }) {
    const to = normalizePhoneNumber(params.to);
    if (!to) {
      throw new Error("A valid phone number is required");
    }

    const client = getClient();
    const text = params.text?.trim() || PICKS_LIVE_MESSAGE;

    const response = await client.messages.create({
      src: env.plivoFromNumber!,
      dst: to,
      text,
    });

    return {
      to,
      messageId: response.messageUuid?.[0] ?? null,
    };
  },

  async sendToAllUsers(options?: { text?: string; delayMs?: number }): Promise<BulkSmsResult> {
    const text = options?.text?.trim() || PICKS_LIVE_MESSAGE;
    const delayMs = Math.max(500, options?.delayMs ?? env.bulkSmsDelayMs);
    const client = getClient();

    const users = await User.find(
      { phoneNumber: { $exists: true, $ne: null } },
      { phoneNumber: 1 }
    ).lean();

    const uniqueNumbers = Array.from(
      new Set(
        users
          .map((u) => normalizePhoneNumber(String(u.phoneNumber ?? "")))
          .filter((n): n is string => Boolean(n))
      )
    );

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const failures: Array<{ phoneNumber: string; error: string }> = [];

    for (let i = 0; i < uniqueNumbers.length; i += 1) {
      const phoneNumber = uniqueNumbers[i];
      if (!phoneNumber) {
        skipped += 1;
        continue;
      }
      try {
        await client.messages.create({
          src: env.plivoFromNumber!,
          dst: phoneNumber,
          text,
        });
        sent += 1;
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : "Unknown error";
        failures.push({ phoneNumber, error: message });
      }

      const hasMore = i < uniqueNumbers.length - 1;
      if (hasMore) {
        await sleep(delayMs);
      }
    }

    return {
      attempted: uniqueNumbers.length,
      sent,
      failed,
      skipped,
      failures,
    };
  },
};

