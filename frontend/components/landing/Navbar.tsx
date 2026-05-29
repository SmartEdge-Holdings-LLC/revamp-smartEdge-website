"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { readAuthSession } from "@/lib/authCookies";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Buy Picks", href: "/#pricing" },
  { label: "Odds", href: "/odds" },
  { label: "Experts Picks", href: "/expert-picks" },
  { label: "Free Picks", href: "/free-picks" },
  { label: "Contact", href: "/contact-us" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { status } = useSession();
  const adminSession = readAuthSession();

  const isLoggedIn = status === "authenticated" || Boolean(adminSession?.token);
  const dashboardHref =
    adminSession?.role === "handicapper"
      ? "/admin/picks"
      : adminSession?.token
        ? "/admin"
        : "/dashboard";

  return (
    <header className="relative z-10 border-none bg-transparent text-slate-100">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-md outline-offset-4 focus-visible:outline-2 focus-visible:outline-white/30"
        >
          <span className="relative block h-10 w-44 sm:h-11 sm:w-56">
            <Image
              src="/logo.webp"
              alt="SmartEdgePicks"
              fill
              className="object-contain object-left"
              sizes="(max-width: 640px) 176px, 224px"
              priority
            />
          </span>
        </Link>

        <div className="hidden items-center gap-8 typo-body-md text-slate-200 md:flex">
          {NAV_LINKS.map((item) => {
            const isActive =
              !item.href.startsWith("/#") &&
              (pathname === item.href || pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative transition hover:text-white",
                  isActive && "text-white"
                )}
              >
                {item.label}
                {isActive ? (
                  <span
                    className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-accent"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link href={isLoggedIn ? dashboardHref : "/login"}>
            <Button className="typo-button-md cursor-pointer border-0 bg-transparent px-3 font-semibold tracking-normal text-slate-100 ring-1 ring-white/20 hover:bg-white/10">
              {isLoggedIn ? "Dashboard" : "Log in"}
            </Button>
          </Link>
          <Link href="/#pricing">
            <Button className="typo-button-md border-0 bg-accent tracking-normal text-slate-950 hover:brightness-[1.06]">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
