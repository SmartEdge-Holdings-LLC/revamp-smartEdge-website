"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readAuthSession } from "@/lib/authCookies";

const HANDICAPPER_HOME = "/admin/handicappers";

/** Routes handicappers may access (upload picks + Jonah subscribers). */
const HANDICAPPER_ALLOWED_PREFIXES = [
  HANDICAPPER_HOME,
  "/admin/picks",
  "/admin/settings",
];

function isHandicapperAllowedPath(pathname: string) {
  return HANDICAPPER_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Redirects `handicapper` role away from full admin routes. */
export function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  useEffect(() => {
    const session = readAuthSession();
    if (!session) return;

    if (session.role === "handicapper" && !isHandicapperAllowedPath(pathname)) {
      router.replace(HANDICAPPER_HOME);
    }
  }, [pathname, router]);

  return <>{children}</>;
}
