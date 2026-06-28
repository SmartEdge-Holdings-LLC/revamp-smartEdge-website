import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  AUTH_COOKIE,
  isAuthTokenExpired,
  parseAuthSessionFromCookieValues,
} from "@/lib/authSession";
import { parseSubscriptionPlanParams } from "@/lib/subscription-plan";

/**
 * Clears auth cookies for admin/handicapper sessions
 */
function clearAuthCookies(res: NextResponse) {
  res.cookies.delete(AUTH_COOKIE.TOKEN);
  res.cookies.delete(AUTH_COOKIE.ROLE);
  res.cookies.delete(AUTH_COOKIE.EMAIL);
  return res;
}

/**
 * Constructs a safe redirect URL using request headers, respecting proxy forwarding
 */
function getBaseUrlFromRequest(req: {
  headers: { get: (name: string) => string | null };
  url: string;
}): string {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl;

  // Redirect logged-in users away from login/register pages
  if (pathname === "/login" || pathname === "/forgot-password") {
    const user = req.auth?.user;
    const hasUserSession = user && "backendToken" in user;

    const adminSession = parseAuthSessionFromCookieValues(
      req.cookies.get(AUTH_COOKIE.TOKEN)?.value,
      req.cookies.get(AUTH_COOKIE.ROLE)?.value,
      req.cookies.get(AUTH_COOKIE.EMAIL)?.value
    );

    const baseUrl = getBaseUrlFromRequest(req);

    // Redirect member to dashboard
    if (hasUserSession) {
      return NextResponse.redirect(new URL("/dashboard", baseUrl));
    }

    // Redirect admin/handicapper to admin
    if (adminSession) {
      return NextResponse.redirect(new URL("/admin", baseUrl));
    }
  }

  if (pathname === "/register") {
    const plan = parseSubscriptionPlanParams(
      searchParams.get("brand"),
      searchParams.get("tier")
    );
    const baseUrl = getBaseUrlFromRequest(req);

    if (!plan) {
      return NextResponse.redirect(new URL("/?pricing", baseUrl));
    }

    // Also redirect logged-in users away from register
    const user = req.auth?.user;
    const hasUserSession = user && "backendToken" in user;

    const adminSession = parseAuthSessionFromCookieValues(
      req.cookies.get(AUTH_COOKIE.TOKEN)?.value,
      req.cookies.get(AUTH_COOKIE.ROLE)?.value,
      req.cookies.get(AUTH_COOKIE.EMAIL)?.value
    );

    if (hasUserSession) {
      return NextResponse.redirect(new URL("/dashboard", baseUrl));
    }

    if (adminSession) {
      return NextResponse.redirect(new URL("/admin", baseUrl));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    const user = req.auth?.user;
    const backendToken =
      user && "backendToken" in user
        ? (user as { backendToken?: string }).backendToken
        : undefined;

    const baseUrl = getBaseUrlFromRequest(req);

    // Check if token is expired
    if (backendToken && isAuthTokenExpired(backendToken)) {
      const res = NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, baseUrl));
      // Clear any potential auth cookies as well
      return clearAuthCookies(res);
    }

    if (!user || !backendToken) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, baseUrl));
    }
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(AUTH_COOKIE.TOKEN)?.value;
    const role = req.cookies.get(AUTH_COOKIE.ROLE)?.value;
    const email = req.cookies.get(AUTH_COOKIE.EMAIL)?.value;

    const session = parseAuthSessionFromCookieValues(token, role, email);
    const baseUrl = getBaseUrlFromRequest(req);

    // Check if token exists but is expired
    if (token && isAuthTokenExpired(token)) {
      const res = NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, baseUrl));
      return clearAuthCookies(res);
    }

    if (!session) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, baseUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/forgot-password", "/register", "/dashboard/:path*", "/admin/:path*"],
};
