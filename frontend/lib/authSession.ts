import type { AppRole } from "@/types/auth";

export const AUTH_COOKIE = {
  TOKEN: "sep_token",
  ROLE: "sep_role",
  EMAIL: "sep_email",
} as const;

const ADMIN_ROLES: AppRole[] = ["admin", "subadmin", "handicapper", "superadmin"];

type JwtPayload = { exp?: number };

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof Buffer !== "undefined"
        ? Buffer.from(base64, "base64").toString("utf8")
        : atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** True when the JWT is missing `exp` or past its expiry (with a 30s clock skew buffer). */
export function isAuthTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + 30_000;
}

export function isAdminRole(role: string): role is Exclude<AppRole, "member"> {
  return (ADMIN_ROLES as string[]).includes(role);
}

export function parseAuthSessionFromCookieValues(
  token: string | undefined,
  role: string | undefined,
  email: string | undefined
): { token: string; role: AppRole; email: string } | null {
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    typeof role !== "string" ||
    typeof email !== "string" ||
    !isAdminRole(role) ||
    isAuthTokenExpired(token)
  ) {
    return null;
  }
  return { token, role, email };
}

export function readAuthCookies(
  getCookie: (name: string) => string | undefined
): { token: string; role: AppRole; email: string } | null {
  return parseAuthSessionFromCookieValues(
    getCookie(AUTH_COOKIE.TOKEN),
    getCookie(AUTH_COOKIE.ROLE),
    getCookie(AUTH_COOKIE.EMAIL)
  );
}

export function loginRedirectPath(pathname: string): string {
  if (!pathname || pathname === "/login") return "/login";
  return `/login?redirect=${encodeURIComponent(pathname)}`;
}

export function loginRedirectUrl(pathname: string, baseUrl: string): URL {
  const url = new URL(loginRedirectPath(pathname), baseUrl);
  return url;
}
