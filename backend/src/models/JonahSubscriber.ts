import mongoose, { Document, Schema, Types } from "mongoose";
import type { PlanName, SubscriptionStatus } from "./User";

export interface IJonahSubscriber extends Document {
  userId: Types.ObjectId;
  email: string;
  name: string;
  image?: string;
  stripeCustomerId?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  state?: string | null;
  zip?: string | null;
  phoneNumber?: string | null;
  wpRole?: string | null;
  subscriptionId?: string | null;
  subscriptionStatus: SubscriptionStatus;
  currentPlan: PlanName;
  priceId?: string | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd: boolean;
  userCreatedAt: Date;
  userUpdatedAt: Date;
  jonahProductId: string;
  jonahProductName: string;
  syncedAt: Date;
}

const jonahSubscriberSchema = new Schema<IJonahSubscriber>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String },
    stripeCustomerId: { type: String, default: null },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    address: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    wpRole: { type: String },
    subscriptionId: { type: String, default: null },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "trialing", "past_due", "canceled", "unpaid"],
      required: true,
    },
    currentPlan: {
      type: String,
      enum: [
        "free",
        "smartedgeVIP",
        "smartedgeVIPPremium",
        "jonahMonthlyStandard",
        "jonahMonthlyVip",
        "monthlyStandard",
        "monthlyVip",
        "starter",
        "pro",
        "enterprise",
      ],
      required: true,
    },
    priceId: { type: String, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    userCreatedAt: { type: Date, required: true },
    userUpdatedAt: { type: Date, required: true },
    jonahProductId: { type: String, required: true },
    jonahProductName: { type: String, required: true },
    syncedAt: { type: Date, required: true },
  },
  { timestamps: false }
);

jonahSubscriberSchema.index({ email: 1 });
jonahSubscriberSchema.index({ subscriptionStatus: 1 });
jonahSubscriberSchema.index({ userCreatedAt: -1 });
jonahSubscriberSchema.index({ jonahProductId: 1 });

export const JonahSubscriber = mongoose.model<IJonahSubscriber>(
  "JonahSubscriber",
  jonahSubscriberSchema
);
