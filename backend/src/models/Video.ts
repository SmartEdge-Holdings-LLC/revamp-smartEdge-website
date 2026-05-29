import mongoose, { Document, Schema, Types } from "mongoose";
import type { VideoPlatform } from "../lib/videoUrl";

export const VIDEO_PLATFORMS = ["youtube", "tiktok", "instagram"] as const;

export type { VideoPlatform };

export const VIDEO_STATUS = ["active", "inactive"] as const;

export type VideoStatus = (typeof VIDEO_STATUS)[number];

export interface IVideo extends Document {
  platform: VideoPlatform;
  url: string;
  externalId: string | null;
  title: string;
  status: VideoStatus;
  sortOrder: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    platform: { type: String, enum: VIDEO_PLATFORMS, required: true },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    externalId: { type: String, trim: true, maxlength: 128, default: null },
    title: { type: String, trim: true, maxlength: 200, default: "" },
    status: { type: String, enum: VIDEO_STATUS, required: true, default: "active" },
    sortOrder: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

videoSchema.index({ status: 1, sortOrder: -1, createdAt: -1 });
videoSchema.index({ platform: 1, createdAt: -1 });
videoSchema.index({ title: "text", url: "text" });

export const Video = mongoose.model<IVideo>("Video", videoSchema);
