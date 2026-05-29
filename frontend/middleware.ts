import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
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

  return NextResponse.next();
});

export const config = {
  matcher: ["/register", "/dashboard/:path*"],
};
