import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  AUTH_COOKIE,
  isAuthTokenExpired,
  loginRedirectUrl,
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

    // Redirect member to dashboard
    if (hasUserSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Redirect admin/handicapper to admin
    if (adminSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/register") {
    const plan = parseSubscriptionPlanParams(
      searchParams.get("brand"),
      searchParams.get("tier")
    );
    if (!plan) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.hash = "pricing";
      url.search = "";
      return NextResponse.redirect(url);
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
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (adminSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    const user = req.auth?.user;
    const backendToken =
      user && "backendToken" in user
        ? (user as { backendToken?: string }).backendToken
        : undefined;

    // Check if token is expired
    if (backendToken && isAuthTokenExpired(backendToken)) {
      const res = NextResponse.redirect(loginRedirectUrl(pathname, req.url));
      // Clear any potential auth cookies as well
      return clearAuthCookies(res);
    }

    if (!user || !backendToken) {
      return NextResponse.redirect(loginRedirectUrl(pathname, req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(AUTH_COOKIE.TOKEN)?.value;
    const role = req.cookies.get(AUTH_COOKIE.ROLE)?.value;
    const email = req.cookies.get(AUTH_COOKIE.EMAIL)?.value;

    const session = parseAuthSessionFromCookieValues(token, role, email);

    // Check if token exists but is expired
    if (token && isAuthTokenExpired(token)) {
      const res = NextResponse.redirect(loginRedirectUrl(pathname, req.url));
      return clearAuthCookies(res);
    }

    if (!session) {
      return NextResponse.redirect(loginRedirectUrl(pathname, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/forgot-password", "/register", "/dashboard/:path*", "/admin/:path*"],
};
