import mongoose, { Document, Schema } from "mongoose";

export interface IJonahSyncMeta extends Document {
  key: "catalog";
  products: { id: string; name: string }[];
  priceIds: string[];
  subscriberCount: number;
  syncedAt: Date;
}

const jonahSyncMetaSchema = new Schema<IJonahSyncMeta>({
  key: { type: String, enum: ["catalog"], required: true, unique: true },
  products: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      _id: false,
    },
  ],
  priceIds: [{ type: String }],
  subscriberCount: { type: Number, default: 0 },
  syncedAt: { type: Date, required: true },
});

export const JonahSyncMeta = mongoose.model<IJonahSyncMeta>("JonahSyncMeta", jonahSyncMetaSchema);
