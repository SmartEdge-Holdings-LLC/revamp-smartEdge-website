"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readAuthSession, redirectToLogin } from "@/lib/authCookies";

const HANDICAPPER_HOME = "/admin";

/** Routes handicappers may access (dashboard, picks, Jonah subscribers). */
const HANDICAPPER_ALLOWED_PREFIXES = [
  HANDICAPPER_HOME,
  "/admin/handicappers",
  "/admin/picks",
  "/admin/settings",
];

function isHandicapperAllowedPath(pathname: string) {
  if (pathname === "/admin") return true;
  return HANDICAPPER_ALLOWED_PREFIXES.filter((p) => p !== "/admin").some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Redirects `handicapper` role away from full admin routes. */
export function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  useEffect(() => {
    const session = readAuthSession();
    if (!session) {
      redirectToLogin(pathname);
      return;
    }

    if (session.role === "handicapper" && !isHandicapperAllowedPath(pathname)) {
      router.replace(HANDICAPPER_HOME);
    }
  }, [pathname, router]);

  return <>{children}</>;
}
