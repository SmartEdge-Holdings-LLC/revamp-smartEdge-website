import mongoose, { Document, Schema } from "mongoose";

/**
 * `admin` = full access (create sub-admins).
 * `subadmin` = delegated admin (manage admins list / update / delete).
 * `handicapper` = Jonah subscribers + own picks (`/admin/handicappers`, `/admin/picks`, scoped pick APIs).
 */
export type AdminRole = "admin" | "subadmin" | "handicapper";

export interface IAdmin extends Document {
  email: string;
  name: string;
  password: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "subadmin", "handicapper"], default: "subadmin" },
  },
  { timestamps: true }
);

adminSchema.set("toJSON", {
  transform(_doc, ret) {
    const o = ret as unknown as Record<string, unknown>;
    delete o.password;
    return o;
  },
});

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
