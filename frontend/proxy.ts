import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  AUTH_COOKIE,
  isAuthTokenExpired,
  loginRedirectUrl,
  parseAuthSessionFromCookieValues,
} from "@/lib/authSession";
import { parseSubscriptionPlanParams } from "@/lib/subscription-plan";

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl;

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
  }

  if (pathname.startsWith("/dashboard")) {
    const user = req.auth?.user;
    const backendToken =
      user && "backendToken" in user
        ? (user as { backendToken?: string }).backendToken
        : undefined;
    if (!user || !backendToken || isAuthTokenExpired(backendToken)) {
      return NextResponse.redirect(loginRedirectUrl(pathname, req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    const session = parseAuthSessionFromCookieValues(
      req.cookies.get(AUTH_COOKIE.TOKEN)?.value,
      req.cookies.get(AUTH_COOKIE.ROLE)?.value,
      req.cookies.get(AUTH_COOKIE.EMAIL)?.value
    );
    if (!session) {
      return NextResponse.redirect(loginRedirectUrl(pathname, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/register", "/dashboard/:path*", "/admin/:path*"],
};
