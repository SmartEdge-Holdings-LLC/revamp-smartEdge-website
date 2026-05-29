import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Admin } from "../models/Admin";
import type { IUser } from "../models/User";
import { User } from "../models/User";

export type SignInMemberResult = {
  user: IUser;
  token: string;
  role: "member";
};

export type SignInAdminResult = {
  admin: ReturnType<InstanceType<typeof Admin>["toJSON"]>;
  token: string;
  role: "admin" | "subadmin" | "handicapper";
};

/**
 * Resolves account from email + password only: tries `users` first, then `admins`.
 * Same email in both collections: a matching **user** password wins.
 */
export async function signInByCredentials(
  email: string,
  password: string
): Promise<SignInMemberResult | SignInAdminResult> {
  const normalized = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalized });
  if (user?.password) {
    const userOk = await bcrypt.compare(password, user.password);
    if (userOk) {
      const now = new Date();
      user.lastLoginAt = now;
      await user.save();
      const token = jwt.sign(
        { userId: user._id.toString() },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] }
      );
      return { user, token, role: "member" };
    }
    throw new Error("Invalid credentials");
  }

  const admin = await Admin.findOne({ email: normalized }).select("+password");
  if (!admin?.password) {
    throw new Error("Invalid credentials");
  }
  const adminOk = await bcrypt.compare(password, admin.password);
  if (!adminOk) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { adminId: admin._id.toString() },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] }
  );

  return {
    admin: admin.toJSON(),
    token,
    role: admin.role,
  };
}
