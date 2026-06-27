import mongoose, { Schema, Document } from "mongoose";

export interface INews extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  cta?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema = new Schema<INews>(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    cta: { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

export const News = mongoose.model<INews>("News", newsSchema);
