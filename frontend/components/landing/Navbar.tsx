"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { readAuthSession } from "@/lib/authCookies";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const NAV_LINKS = [
  { label: "Buy Picks", href: "/#pricing" },
  { label: "Odds", href: "/odds" },
  { label: "Experts Picks", href: "/expert-picks" },
  { label: "Free Picks", href: "/free-picks" },
  { label: "Betting Resources", href: "/betting-resources" },
  { label: "Contact", href: "/contact-us" },
] as const;

const DASHBOARD_TABS = [
  { label: "Premium Picks", href: "/dashboard" },
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Billing", href: "/dashboard/billing" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const { data: session, status } = useSession();
  const adminSession = readAuthSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  const { user: storeUser, setUser: setStoreUser } = useAuthStore();

  // Sync session with Zustand store - only update when session status changes
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      setStoreUser(session.user);
    } else if (adminSession) {
      setStoreUser(adminSession as any);
    } else {
      setStoreUser(null);
    }
    setHasHydrated(true);
  }, [status, session?.user?.email, adminSession?.token]);

  const isLoggedIn = hasHydrated && (!!storeUser || status === "authenticated" || Boolean(adminSession?.token));
  const dashboardHref =
    adminSession?.role === "handicapper"
      ? "/admin/picks"
      : adminSession?.token
        ? "/admin"
        : "/dashboard";

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="relative z-10 border-b border-gray-800 bg-black text-white">
      <nav className="flex w-full items-center justify-between px-8 py-5 sm:px-10 md:px-12 lg:px-16">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-md outline-offset-4 focus-visible:outline-2 focus-visible:outline-white/30"
          onClick={closeMenu}
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

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-10 typo-body-md text-gray-300 md:flex">
          {(isDashboard ? DASHBOARD_TABS : NAV_LINKS).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative whitespace-nowrap transition hover:text-white",
                  isActive && "text-white font-semibold"
                )}
              >
                {item.label}
                {isActive ? (
                  <span
                    className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#ED723C]"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </div>


        {/* Desktop Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href={isLoggedIn ? dashboardHref : "/login"}>
            <Button className="typo-button-md cursor-pointer border-0 bg-transparent px-3 font-semibold tracking-normal text-gray-300 ring-1 ring-gray-600 hover:bg-white/10 hover:text-white">
              {isLoggedIn ? "Dashboard" : "Log in"}
            </Button>
          </Link>
          <Link href="/#pricing">
            <Button className="pricing-accent-gradient typo-button-md border-0 px-5 py-3.5 tracking-normal text-white shadow-[0_4px_24px_rgb(237_114_60/0.3)] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99]">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-gray-800 bg-black md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-6 py-4">
            {(isDashboard ? DASHBOARD_TABS : NAV_LINKS).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "block rounded-md px-3 py-2 typo-body-md transition hover:bg-white/10",
                    isActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-gray-300"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="space-y-2 border-t border-gray-800 pt-4">
              <Link
                href={isLoggedIn ? dashboardHref : "/login"}
                onClick={closeMenu}
                className="block"
              >
                <Button className="w-full typo-button-md cursor-pointer border-0 bg-transparent font-semibold tracking-normal text-gray-300 ring-1 ring-gray-600 hover:bg-white/10 hover:text-white">
                  {isLoggedIn ? "Dashboard" : "Log in"}
                </Button>
              </Link>
              <Link href="/#pricing" onClick={closeMenu} className="block">
                <Button className="w-full pricing-accent-gradient typo-button-md border-0 px-5 py-3.5 tracking-normal text-white shadow-[0_4px_24px_rgb(237_114_60/0.3)] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
