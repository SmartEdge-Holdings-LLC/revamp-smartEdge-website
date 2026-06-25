import mongoose, { Document, Schema, Types } from "mongoose";

export const TOURNAMENT_STATUS = ["active", "inactive", "completed"] as const;
export type TournamentStatus = (typeof TOURNAMENT_STATUS)[number];

export const PRIZE_TYPES = ["discount", "freeMonth", "custom"] as const;
export type PrizeType = (typeof PRIZE_TYPES)[number];

export interface ITournamentPrize {
  type: PrizeType;
  value: number;
  description?: string;
}

export interface ITournament extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  status: TournamentStatus;
  gameIds: Types.ObjectId[];
  prize: ITournamentPrize;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: TOURNAMENT_STATUS,
      required: true,
      default: "inactive",
    },
    gameIds: [{ type: Schema.Types.ObjectId, ref: "Pick" }],
    prize: {
      type: {
        type: String,
        enum: PRIZE_TYPES,
        required: true,
      },
      value: { type: Number, required: true, min: 0 },
      description: { type: String, trim: true, maxlength: 500 },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

tournamentSchema.index({ status: 1, startDate: 1 });
tournamentSchema.index({ endDate: 1 });

export const Tournament = mongoose.model<ITournament>(
  "Tournament",
  tournamentSchema
);
