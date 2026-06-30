import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../config/env";
import { stripe } from "../lib/stripe";
import { JonahSubscriber } from "../models/JonahSubscriber";
import { PasswordReset } from "../models/PasswordReset";
import { Promotion } from "../models/Promotion";
import { Subscription } from "../models/Subscription";
import { User } from "../models/User";

export const userService = {
  async register(input: { email: string; name: string; password: string }) {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw new Error("Email already in use");
    }

    const hashed = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      email: input.email,
      name: input.name,
      password: hashed,
    });

    const token = jwt.sign(
      { userId: user._id.toString() },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] }
    );

    return { user, token };
  },
  async login(input: { email: string; password: string }) {
    const user = await User.findOne({ email: input.email });
    if (!user?.password) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { userId: user._id.toString() },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] }
    );

    return { user, token };
  },

  async updateOwnPassword(input: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    const user = await User.findById(input.userId);
    if (!user?.password) throw new Error("User not found");

    const valid = await bcrypt.compare(input.currentPassword, user.password);
    if (!valid) throw new Error("Current password is incorrect");

    if (input.currentPassword === input.newPassword) {
      throw new Error("New password must be different from current password");
    }

    user.password = await bcrypt.hash(input.newPassword, 10);
    await user.save();
    return { message: "Password updated successfully" };
  },

  /**
   * Paginated app users for admin console; excludes `password`. Sorted by `createdAt` descending.
   * Optional `search` performs a case-insensitive substring match on `email`.
   * Optional `status` filters either brand's `subscriptionStatus` (OR).
   * Optional `joinedFrom` / `joinedTo` filter on `createdAt` (inclusive of both endpoints).
   */
  async findPagedForAdmin(options: {
    page: number;
    limit: number;
    search?: string;
    status?: string[];
    joinedFrom?: Date;
    joinedTo?: Date;
  }) {
    const { page, limit, search, status, joinedFrom, joinedTo } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    const trimmed = search?.trim();
    if (trimmed) {
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.email = { $regex: escaped, $options: "i" };
    }
    if (status && status.length > 0) {
      // Match users who have at least one subscription with the specified status
      // Using $elemMatch to ensure we're matching specific array elements
      filter.$or = [
        { "brandSubscriptions.smartedge": { $elemMatch: { subscriptionStatus: { $in: status } } } },
        { "brandSubscriptions.jonah": { $elemMatch: { subscriptionStatus: { $in: status } } } },
      ];
    }
    if (joinedFrom || joinedTo) {
      const range: Record<string, Date> = {};
      if (joinedFrom) range.$gte = joinedFrom;
      if (joinedTo) range.$lte = joinedTo;
      filter.createdAt = range;
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).select("-password").skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit) || 1;
    return { users, page, limit, total, totalPages };
  },

  /**
   * Permanently removes a member and related app data. Cancels Stripe subscriptions
   * and deletes the Stripe customer when present.
   */
  async deleteByIdForAdmin(userId: string) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user id");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const objectId = user._id;
    const subscriptionIds = [
      user.brandSubscriptions?.smartedge?.stripeSubscriptionId,
      user.brandSubscriptions?.jonah?.stripeSubscriptionId,
    ].filter((id): id is string => typeof id === "string" && id.length > 0);

    for (const subscriptionId of subscriptionIds) {
      try {
        await stripe.subscriptions.cancel(subscriptionId);
      } catch {
        /* subscription may already be canceled or missing in Stripe */
      }
    }

    if (user.stripeCustomerId) {
      try {
        await stripe.customers.del(user.stripeCustomerId);
      } catch {
        /* customer may already be deleted in Stripe */
      }
    }

    await Promise.all([
      Subscription.deleteMany({ userId: objectId }),
      JonahSubscriber.deleteOne({ userId: objectId }),
      PasswordReset.deleteMany({ targetType: "member", targetId: objectId }),
      Promotion.updateMany(
        { assignedUserIds: objectId },
        { $pull: { assignedUserIds: objectId } }
      ),
    ]);

    await User.deleteOne({ _id: objectId });
    return { deleted: true };
  },
};
