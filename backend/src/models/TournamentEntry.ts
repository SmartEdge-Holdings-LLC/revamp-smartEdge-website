import mongoose, { Document, Schema, Types } from "mongoose";

export const PRIZE_STATUS = ["unclaimed", "claimed"] as const;
export type PrizeStatus = (typeof PRIZE_STATUS)[number];

export interface ITournamentEntry extends Document {
  tournamentId: Types.ObjectId;
  memberId: Types.ObjectId;
  picks: Types.ObjectId[];
  score: number;
  rank: number;
  prizeStatus: PrizeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const tournamentEntrySchema = new Schema<ITournamentEntry>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    memberId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    picks: [{ type: Schema.Types.ObjectId, ref: "Pick" }],
    score: { type: Number, default: 0, min: 0 },
    rank: { type: Number, default: 0, min: 0 },
    prizeStatus: {
      type: String,
      enum: PRIZE_STATUS,
      required: true,
      default: "unclaimed",
    },
  },
  { timestamps: true }
);

tournamentEntrySchema.index({ tournamentId: 1, memberId: 1 }, { unique: true });
tournamentEntrySchema.index({ tournamentId: 1, score: -1 });

export const TournamentEntry = mongoose.model<ITournamentEntry>(
  "TournamentEntry",
  tournamentEntrySchema
);
