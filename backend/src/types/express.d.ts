import type { IAdmin } from "../models/Admin";
import type { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tokenPayload?: {
        userId: string;
      };
      admin?: IAdmin;
      adminTokenPayload?: {
        adminId: string;
      };
    }
  }
}

export {};
