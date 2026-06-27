
import mongoose, { Document, Schema, Types } from "mongoose";
import { BET_TYPES, type BetType } from "../config/pickBetTypes";
import { LEAGUES, type League } from "../config/pickLeagues";

export { BET_TYPES, type BetType, LEAGUES, type League };

export const PICK_ACCESS = ["free", "smartedgeVIP", "smartedgeVIPPremium", "jonahvip", "jonah-vip-premium", "tournament"] as const;

export type PickAccess = (typeof PICK_ACCESS)[number];

export const PICK_STATUS = ["active", "inactive"] as const;

export type PickStatus = (typeof PICK_STATUS)[number];

export const PICK_RESULTS = ["pending", "won", "lost"] as const;

export type PickResult = (typeof PICK_RESULTS)[number];

export interface IPick extends Document {
  league: League;
  awayTeamId?: string;
  homeTeamId?: string;
  awayTeamName?: string;
  homeTeamName?: string;
  awayTeamLogo?: string;
  homeTeamLogo?: string;
  game: string;
  pickTitle: string;
  detailedAnalysis?: string;
  odds?: string;
  betType: BetType;
  /** 1–100 confidence score (optional, defaults to 75) */
  confidence?: number;
  /** Access level: "free" (all users), "smartedgeVIPPremium" (premium members only), "both" (free and premium), "tournament" (tournament participants only), "monthly_vip" (monthly VIP members only) */
  access: PickAccess;
  /** Whether the pick is published (active) or hidden (inactive) */
  status: PickStatus;
  /** Scheduled match/game time */
  matchTime?: Date;
  /** Mark this pick as Pick/Lock of the Day */
  isPickOfDay?: boolean;
  result: PickResult;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pickSchema = new Schema<IPick>(
  {
    league: { type: String, enum: LEAGUES, required: true },
    awayTeamId: { type: String, trim: true, maxlength: 100 },
    homeTeamId: { type: String, trim: true, maxlength: 100 },
    awayTeamName: { type: String, trim: true, maxlength: 120 },
    homeTeamName: { type: String, trim: true, maxlength: 120 },
    awayTeamLogo: { type: String, trim: true, maxlength: 256 },
    homeTeamLogo: { type: String, trim: true, maxlength: 256 },
    game: { type: String, required: true, trim: true, maxlength: 500 },
    pickTitle: { type: String, required: true, trim: true, maxlength: 300 },
    detailedAnalysis: { type: String, trim: true, maxlength: 10000 },
    odds: { type: String, trim: true, maxlength: 64 },
    betType: { type: String, enum: BET_TYPES, required: true },
    confidence: { type: Number, min: 1, max: 100 },
    access: { type: String, enum: PICK_ACCESS, required: true, default: "smartedgeVIPPremium" },
    status: { type: String, enum: PICK_STATUS, required: true, default: "active" },
    matchTime: { type: Date },
    isPickOfDay: { type: Boolean, default: false },
    result: { type: String, enum: PICK_RESULTS, default: "pending" },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

pickSchema.index({ createdAt: -1 });
pickSchema.index({ league: 1, createdAt: -1 });
pickSchema.index({ betType: 1, createdAt: -1 });
pickSchema.index({ access: 1, createdAt: -1 });
pickSchema.index({ status: 1, createdAt: -1 });
pickSchema.index({ game: "text", pickTitle: "text" });

export const Pick = mongoose.model<IPick>("Pick", pickSchema);
