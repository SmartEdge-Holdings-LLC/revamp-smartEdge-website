import mongoose, { Document, Schema, Types } from "mongoose";

export const PROMOTION_STATUS = ["active", "inactive"] as const;
export type PromotionStatus = (typeof PROMOTION_STATUS)[number];

export interface IPromotion extends Document {
  stripeCouponId: string;
  stripePromotionCodeId: string;
  code: string;
  description: string;
  /** Percent off (1–100). */
  discountPercent: number;
  maxRedemptions: number | null;
  expiresAt: Date | null;
  status: PromotionStatus;
  /** Empty = any authenticated user with the code; otherwise restricted to these users. */
  assignedUserIds: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    stripeCouponId: { type: String, required: true, trim: true },
    stripePromotionCodeId: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    maxRedemptions: { type: Number, min: 1, default: null },
    expiresAt: { type: Date, default: null },
    status: { type: String, enum: PROMOTION_STATUS, required: true, default: "active" },
    assignedUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

promotionSchema.index({ status: 1, expiresAt: 1 });
promotionSchema.index({ assignedUserIds: 1 });

export const Promotion = mongoose.model<IPromotion>("Promotion", promotionSchema);
