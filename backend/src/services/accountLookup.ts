import { Admin, type IAdmin } from "../models/Admin";
import { User, type IUser } from "../models/User";

export type AccountTarget =
  | { targetType: "member"; record: IUser }
  | { targetType: "admin"; record: IAdmin };

/** Resolve account by email — members (`users`) first, then console accounts (`admins`). */
export async function findAccountByEmail(email: string): Promise<AccountTarget | null> {
  const normalized = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalized });
  if (user) return { targetType: "member", record: user };

  const admin = await Admin.findOne({ email: normalized });
  if (admin) return { targetType: "admin", record: admin };

  return null;
}

export function accountRoleLabel(target: AccountTarget): string {
  if (target.targetType === "member") return "member";
  return target.record.role;
}
