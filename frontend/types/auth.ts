/** Backend `Admin.role` legacy `superadmin` is still returned by some deployments; treat it like `admin`. */
export type AppRole = "member" | "admin" | "subadmin" | "handicapper" | "superadmin";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthAdmin {
  _id: string;
  email: string;
  name: string;
  role: Exclude<AppRole, "member">;
  createdAt?: string;
  updatedAt?: string;
}

export type { BackendMemberUser as AuthMember } from "@/types/member-session";

export interface LoginResponseMember {
  user: AuthMember;
  token: string;
  role: "member";
  /** Post-login route for members (from `POST /api/auth/login`). */
  redirect: "/dashboard";
}

export interface LoginResponseAdmin {
  admin: AuthAdmin;
  token: string;
  role: Exclude<AppRole, "member">;
  redirect: string;
}

export type LoginResponse = LoginResponseMember | LoginResponseAdmin;

/** Narrowed shape we persist to cookies / use across the UI. */
export interface AuthSession {
  email: string;
  role: AppRole;
  token: string;
  name?: string;
  userId?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  resetToken: string;
  expiresIn: string;
  accountType: "member" | "admin";
  role: AppRole;
}

export interface ResetPasswordRequest {
  resetToken: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}
