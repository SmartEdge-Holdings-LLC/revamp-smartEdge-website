import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Admin, AdminRole } from "../models/Admin";

export const adminService = {
  async create(input: { email: string; name: string; password: string; role?: AdminRole }) {
    const existing = await Admin.findOne({ email: input.email });
    if (existing) {
      throw new Error("Email already in use");
    }
    const hashed = await bcrypt.hash(input.password, 10);
    const admin = await Admin.create({
      email: input.email,
      name: input.name,
      password: hashed,
      role: input.role ?? "subadmin",
    });
    const safe = await Admin.findById(admin._id).lean();
    return safe;
  },

  async findAll() {
    return Admin.find().sort({ createdAt: -1 }).select("-password").lean();
  },

  async findByIdSafe(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid admin id");
    }
    return Admin.findById(id).select("-password").lean();
  },

  async updateById(
    id: string,
    input: { email?: string; name?: string; password?: string; role?: AdminRole }
  ) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid admin id");
    }
    const admin = await Admin.findById(id);
    if (!admin) {
      throw new Error("Admin not found");
    }

    if (input.email !== undefined) {
      const taken = await Admin.findOne({ email: input.email, _id: { $ne: id } });
      if (taken) throw new Error("Email already in use");
      admin.email = input.email;
    }
    if (input.name !== undefined) admin.name = input.name;
    if (input.role !== undefined) admin.role = input.role;
    if (input.password !== undefined && input.password.length > 0) {
      admin.password = await bcrypt.hash(input.password, 10);
    }
    await admin.save();
    return Admin.findById(id).select("-password").lean();
  },

  async deleteById(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid admin id");
    }
    const count = await Admin.countDocuments();
    if (count <= 1) {
      throw new Error("Cannot delete the last admin account");
    }
    const deleted = await Admin.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Admin not found");
    }
    return { deleted: true };
  },

  async updateOwnPassword(input: {
    adminId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    if (!mongoose.isValidObjectId(input.adminId)) {
      throw new Error("Invalid admin id");
    }

    const admin = await Admin.findById(input.adminId).select("+password");
    if (!admin) {
      throw new Error("Admin not found");
    }

    const ok = await bcrypt.compare(input.currentPassword, admin.password);
    if (!ok) {
      throw new Error("Current password is incorrect");
    }

    if (input.currentPassword === input.newPassword) {
      throw new Error("New password must be different from current password");
    }

    admin.password = await bcrypt.hash(input.newPassword, 10);
    await admin.save();
    return { message: "Password updated successfully" };
  },
};
