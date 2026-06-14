"use client";

import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { AUTH_COOKIE, isAuthTokenExpired } from "@/lib/authSession";
import type { AppRole, AuthSession } from "@/types/auth";

export { AUTH_COOKIE };

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

const baseOptions = {
  maxAge: ONE_WEEK_SECONDS,
  path: "/",
  sameSite: "lax" as const,
  secure: typeof window !== "undefined" ? window.location.protocol === "https:" : false,
};

/** Persists `token`, `role`, `email` so subsequent requests can authenticate. Client-side only. */
export function persistAuthSession(input: { token: string; role: AppRole; email: string }) {
  setCookie(AUTH_COOKIE.TOKEN, input.token, baseOptions);
  setCookie(AUTH_COOKIE.ROLE, input.role, baseOptions);
  setCookie(AUTH_COOKIE.EMAIL, input.email, baseOptions);
}

export function clearAuthSession() {
  deleteCookie(AUTH_COOKIE.TOKEN, { path: "/" });
  deleteCookie(AUTH_COOKIE.ROLE, { path: "/" });
  deleteCookie(AUTH_COOKIE.EMAIL, { path: "/" });
}

export function readAuthSession(): Pick<AuthSession, "token" | "role" | "email"> | null {
  const token = getCookie(AUTH_COOKIE.TOKEN);
  const role = getCookie(AUTH_COOKIE.ROLE);
  const email = getCookie(AUTH_COOKIE.EMAIL);
  if (typeof token !== "string" || typeof role !== "string" || typeof email !== "string") {
    return null;
  }
  if (isAuthTokenExpired(token)) {
    clearAuthSession();
    return null;
  }
  return { token, role: role as AppRole, email };
}

/** Clears admin cookies and sends the browser to login (client-only). */
export function redirectToLogin(redirectPath?: string) {
  clearAuthSession();
  const path =
    redirectPath && redirectPath !== "/login"
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : "/login";
  window.location.assign(path);
}
