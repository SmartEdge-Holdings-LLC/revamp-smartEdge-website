import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Admin } from "../models/Admin";
import { PasswordReset } from "../models/PasswordReset";
import { User } from "../models/User";
import { emailService } from "./emailService";
import { accountRoleLabel, findAccountByEmail } from "./accountLookup";

export const PASSWORD_RESET_EMAIL_NOT_FOUND =
  "No account found with this email address.";

const CODE_SENT_MESSAGE = "A verification code has been sent to your email.";

export class PasswordResetAccountNotFoundError extends Error {
  constructor() {
    super(PASSWORD_RESET_EMAIL_NOT_FOUND);
    this.name = "PasswordResetAccountNotFoundError";
  }
}

const MAX_VERIFY_ATTEMPTS = 5;

type ResetJwtPayload = {
  purpose: "password_reset";
  email: string;
  targetType: "member" | "admin";
  targetId: string;
};

function generateSixDigitCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

async function hashCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

async function verifyCodeHash(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

function signResetToken(payload: ResetJwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.passwordResetTokenExpiresIn as SignOptions["expiresIn"],
  });
}

function verifyResetToken(token: string): ResetJwtPayload {
  const decoded = jwt.verify(token, env.jwtSecret) as ResetJwtPayload & {
    purpose?: string;
  };
  if (decoded.purpose !== "password_reset") {
    throw new Error("Invalid or expired reset token");
  }
  if (!decoded.targetId || !decoded.email || !decoded.targetType) {
    throw new Error("Invalid or expired reset token");
  }
  return decoded;
}

async function updateAccountPassword(
  targetType: "member" | "admin",
  targetId: string,
  password: string
): Promise<void> {
  const hashed = await bcrypt.hash(password, 10);
  if (targetType === "member") {
    const user = await User.findByIdAndUpdate(targetId, { password: hashed });
    if (!user) throw new Error("Account not found");
    return;
  }
  const admin = await Admin.findById(targetId).select("+password");
  if (!admin) throw new Error("Account not found");
  admin.password = hashed;
  await admin.save();
}

export const passwordResetService = {
  async requestCode(email: string): Promise<{ message: string }> {
    const normalized = email.toLowerCase().trim();
    const account = await findAccountByEmail(normalized);

    if (!account) {
      throw new PasswordResetAccountNotFoundError();
    }

    const code = generateSixDigitCode();
    const codeHash = await hashCode(code);
    const expiresAt = new Date(Date.now() + env.passwordResetCodeTtlMinutes * 60 * 1000);

    await PasswordReset.deleteMany({ email: normalized, verifiedAt: { $exists: false } });

    await PasswordReset.create({
      email: normalized,
      codeHash,
      targetType: account.targetType,
      targetId: account.record._id,
      expiresAt,
      attemptCount: 0,
    });

    const displayName = account.record.name?.trim() || "there";

    try {
      await emailService.sendPasswordResetCode({
        to: normalized,
        name: displayName,
        code,
        expiresMinutes: env.passwordResetCodeTtlMinutes,
      });
    } catch (err) {
      console.error("[password-reset] email failed:", (err as Error).message);
      if (env.nodeEnv === "development") {
        console.log(
          `[dev] Password reset code for ${normalized} (email failed — use this code): ${code}`
        );
      } else {
        throw new Error(
          "We could not send the verification email. Check RESEND_API_KEY and EMAIL_FROM, then try again."
        );
      }
    }

    if (env.nodeEnv === "development") {
      console.log(`[dev] Password reset code for ${normalized}: ${code}`);
    }

    return { message: CODE_SENT_MESSAGE };
  },

  async verifyCode(
    email: string,
    code: string
  ): Promise<{
    resetToken: string;
    expiresIn: string;
    accountType: "member" | "admin";
    role: string;
  }> {
    const normalized = email.toLowerCase().trim();
    const trimmedCode = code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      throw new Error("Invalid verification code");
    }

    const record = await PasswordReset.findOne({
      email: normalized,
      verifiedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record) {
      throw new Error("Invalid or expired verification code");
    }

    if (record.attemptCount >= MAX_VERIFY_ATTEMPTS) {
      throw new Error("Too many attempts. Request a new code.");
    }

    const valid = await verifyCodeHash(trimmedCode, record.codeHash);
    if (!valid) {
      record.attemptCount += 1;
      await record.save();
      throw new Error("Invalid verification code");
    }

    record.verifiedAt = new Date();
    await record.save();

    const account = await findAccountByEmail(normalized);
    if (!account || String(account.record._id) !== String(record.targetId)) {
      throw new Error("Account not found");
    }

    const resetToken = signResetToken({
      purpose: "password_reset",
      email: normalized,
      targetType: record.targetType,
      targetId: String(record.targetId),
    });

    return {
      resetToken,
      expiresIn: env.passwordResetTokenExpiresIn,
      accountType: record.targetType,
      role: accountRoleLabel(account),
    };
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    const payload = verifyResetToken(resetToken);
    await updateAccountPassword(payload.targetType, payload.targetId, newPassword);
    await PasswordReset.deleteMany({ email: payload.email });
    return { message: "Password updated successfully" };
  },
};
