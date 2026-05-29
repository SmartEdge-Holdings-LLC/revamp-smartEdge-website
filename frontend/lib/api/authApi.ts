import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse,
} from "@/types/auth";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

async function authPost<T>(path: string, body: unknown): Promise<T> {
  if (!backendUrl) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const response = await fetch(`${backendUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed");
  }

  return data as T;
}

/**
 * `POST /api/auth/login`. Backend resolves account type by email+password and returns either
 * `{ user, token, role: "member", redirect: "/dashboard" }` or
 * `{ admin, token, role, redirect }` for staff accounts.
 *
 * Throws an `Error` with the server-supplied message on non-2xx.
 */
export async function loginRequest(body: LoginRequest): Promise<LoginResponse> {
  if (!backendUrl) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const response = await fetch(`${backendUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as Partial<LoginResponse> & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Invalid credentials");
  }
  return data as LoginResponse;
}

export function forgotPasswordRequest(
  body: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  return authPost<ForgotPasswordResponse>("/api/auth/forgot-password", body);
}

export function verifyResetCodeRequest(
  body: VerifyResetCodeRequest
): Promise<VerifyResetCodeResponse> {
  return authPost<VerifyResetCodeResponse>("/api/auth/verify-reset-code", body);
}

export function resetPasswordRequest(
  body: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  return authPost<ResetPasswordResponse>("/api/auth/reset-password", body);
}
