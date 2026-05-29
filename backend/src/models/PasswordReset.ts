import mongoose, { Document, Schema, Types } from "mongoose";

export type PasswordResetTargetType = "member" | "admin";

export interface IPasswordReset extends Document {
  email: string;
  codeHash: string;
  targetType: PasswordResetTargetType;
  targetId: Types.ObjectId;
  expiresAt: Date;
  attemptCount: number;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    targetType: { type: String, enum: ["member", "admin"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attemptCount: { type: Number, default: 0 },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

passwordResetSchema.index({ email: 1, createdAt: -1 });

export const PasswordReset = mongoose.model<IPasswordReset>(
  "PasswordReset",
  passwordResetSchema
);
