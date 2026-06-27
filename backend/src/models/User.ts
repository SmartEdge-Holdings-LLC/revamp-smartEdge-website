import mongoose, { Document, Schema } from "mongoose";

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid";
export type PlanName =
  | "free"
  | "smartedgeVIP"
  | "smartedgeVIPPremium"
  | "jonahMonthlyStandard"
  | "jonahMonthlyVip"
  | "monthlyStandard"
  | "monthlyVip"
  | "starter"
  | "pro"
  | "enterprise";
export type WpImportedRole = "subscriber" | "administrator";

/** Per-brand subscription snapshot stored on the user (mirrors `subscriptions` collection). */
export type BrandSubscriptionSnapshot = {
  stripeSubscriptionId: string | null;
  planName: PlanName;
  priceId: string | null;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

export type UserBrandSubscriptions = {
  smartedge: BrandSubscriptionSnapshot[];
  jonah: BrandSubscriptionSnapshot[];
};

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  image?: string;
  stripeCustomerId?: string;
  city?: string;
  country?: string;
  address?: string;
  state?: string;
  zip?: string;
  discordUsername?: string;
  phoneNumber?: string;
  wpRole?: WpImportedRole;
  /** Per-brand subscription data (SmartEdge + Jonah). */
  brandSubscriptions: UserBrandSubscriptions;
  /** Last member sign-in or authenticated API activity (for DAU/WAU). */
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const planNameEnum = [
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
] as const;

const brandSubscriptionSnapshotSchema = new Schema<BrandSubscriptionSnapshot>(
  {
    stripeSubscriptionId: { type: String, default: null },
    planName: { type: String, enum: planNameEnum, default: "free" },
    priceId: { type: String, default: null },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "trialing", "past_due", "canceled", "unpaid"],
      default: "inactive",
    },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String },
    image: { type: String },
    stripeCustomerId: { type: String, unique: true, sparse: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    address: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    discordUsername: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    wpRole: { type: String, enum: ["subscriber", "administrator"], required: false },
    brandSubscriptions: {
      smartedge: { type: [brandSubscriptionSnapshotSchema], default: [] },
      jonah: { type: [brandSubscriptionSnapshotSchema], default: [] },
    },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ lastLoginAt: 1 });
userSchema.index({ "brandSubscriptions.smartedge.subscriptionStatus": 1 });
userSchema.index({ "brandSubscriptions.jonah.subscriptionStatus": 1 });
userSchema.index({ "brandSubscriptions.jonah.priceId": 1 });

export const User = mongoose.model<IUser>("User", userSchema);
