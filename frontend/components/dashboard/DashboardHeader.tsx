"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CreditCard, LogOut, Settings, Menu, X } from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "ME").toUpperCase();
}

const DASHBOARD_TABS = [
  { label: "Premium Picks", href: "/dashboard" },
  { label: "Tournaments", href: "/dashboard/tournaments" },
  { label: "Free Picks", href: "/free-picks" },
  { label: "Expert Picks", href: "/expert-picks" },
  { label: "Odds", href: "/odds" },

  { label: "Contact Us", href: "/contact-us" },
];

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const name = user?.name ?? "Member";
  const email = user?.email ?? "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="flex h-16 shrink-0 items-center gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center rounded-md outline-offset-4 focus-visible:outline-2 focus-visible:outline-white/30"
        >
          <span className="relative block h-8 w-40 sm:h-9 sm:w-48">
            <Image
              src="/logo.webp"
              alt="SmartEdgePicks"
              fill
              className="object-contain object-left"
              sizes="(max-width: 640px) 160px, 192px"
              priority
            />
          </span>
        </Link>

        {/* Desktop Navigation Tabs - Centered */}
        <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {DASHBOARD_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive ? "text-white" : "text-subtle hover:text-white"
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex-1 md:flex-initial" />

        {/* Mobile Hamburger Menu */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-subtle hover:text-white transition"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="size-6" />
          ) : (
            <Menu className="size-6" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Open account menu"
            className="inline-flex items-center gap-2.5 rounded-lg p-1 pr-3 text-left transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Avatar className="size-8 ring-1 ring-white/15">
              <AvatarImage src={user?.image ?? undefined} alt="" />
              <AvatarFallback className="bg-white/10 text-xs text-white">
                {initialsFromName(name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden min-w-0 flex-col leading-tight sm:flex">
              <span className="truncate text-sm font-semibold text-white">{name}</span>
              <span className="truncate text-xs text-subtle">{email}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-64 border-white/10 bg-[#0f0f0f] text-slate-100"
          >
            <DropdownMenuLabel className="text-subtle">Member account</DropdownMenuLabel>
            <DropdownMenuItem disabled className="text-slate-500 text-xs">
              {email}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
              <Link href="/dashboard/billing" className="flex items-center gap-2">
                <CreditCard className="size-4" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem
              className="text-red-300 focus:bg-red-500/15 focus:text-red-200 cursor-pointer flex items-center gap-2"
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-black/80 md:hidden">
          <div className="space-y-1 px-4 py-4">
            {DASHBOARD_TABS.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-subtle hover:text-white hover:bg-white/5"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
            <div className="border-t border-white/10 my-2 pt-2">
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex rounded-lg px-4 py-2.5 text-sm font-medium text-subtle hover:text-white hover:bg-white/5 transition-colors items-center gap-2"
              >
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
              <Link
                href="/dashboard/billing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex rounded-lg px-4 py-2.5 text-sm font-medium text-subtle hover:text-white hover:bg-white/5 transition-colors items-center gap-2"
              >
                <CreditCard className="size-4" />
                <span>Billing</span>
              </Link>
              <button
                onClick={() => {
                  void signOut({ callbackUrl: "/login" });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <LogOut className="size-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
