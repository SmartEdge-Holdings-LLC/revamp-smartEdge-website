import mongoose, { Document, Schema, Types } from "mongoose";
import type { StripeBrand } from "../config/stripeProducts";

export type SubscriptionBrand = StripeBrand;

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  brand: SubscriptionBrand;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  priceId: string;
  planName: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: String, enum: ["smartedge", "jonah"], required: true },
    stripeSubscriptionId: { type: String, required: true, unique: true },
    stripeCustomerId: { type: String, required: true },
    status: { type: String, required: true },
    priceId: { type: String, required: true },
    planName: { type: String, required: true },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Date },
    trialStart: { type: Date },
    trialEnd: { type: Date },
  },
  { timestamps: true }
);

// Removed unique index on { userId, brand } to allow multiple subscriptions per user/brand
// Each subscription is now uniquely identified by stripeSubscriptionId
subscriptionSchema.index({ userId: 1, brand: 1 });
subscriptionSchema.index({ userId: 1 });

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);
