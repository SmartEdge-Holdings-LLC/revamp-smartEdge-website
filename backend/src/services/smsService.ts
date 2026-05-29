import Telnyx from "telnyx";
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
  // Keep + and digits only; Telnyx expects E.164.
  const normalized = trimmed.replace(/[^\d+]/g, "");
  return normalized || null;
}

function getClient() {
  if (!env.telnyxApiKey) {
    throw new Error("TELNYX_API_KEY is not configured");
  }
  if (!env.telnyxFromNumber) {
    throw new Error(
      "TELNYX_FROM_NUMBER is not configured. Set your Telnyx SMS number in E.164 format (e.g. +15055232553)."
    );
  }
  if (!env.telnyxMessagingProfileId) {
    throw new Error(
      "TELNYX_MESSAGING_PROFILE_ID is not configured. Assign your Telnyx number to a messaging profile and paste the profile ID here."
    );
  }
  return new Telnyx({ apiKey: env.telnyxApiKey });
}

function buildTelnyxMessagePayload(to: string, text: string) {
  const payload: {
    to: string;
    text: string;
    from?: string;
    messaging_profile_id?: string;
  } = { to, text };

  if (env.telnyxFromNumber) {
    payload.from = env.telnyxFromNumber;
  }
  if (env.telnyxMessagingProfileId) {
    payload.messaging_profile_id = env.telnyxMessagingProfileId;
  }

  return payload;
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

    const response = await client.messages.send(
      buildTelnyxMessagePayload(to, text)
    );

    return {
      to,
      messageId: response?.data?.id ?? null,
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
        await client.messages.send(buildTelnyxMessagePayload(phoneNumber, text));
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

