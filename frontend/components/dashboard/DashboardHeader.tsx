"use client";

import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
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

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const name = user?.name ?? "Member";
  const email = user?.email ?? "";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-sidebar px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="hidden h-6 bg-white/15 sm:block" />

      <div className="min-w-0 flex-1">
        {title?.trim() ? (
          <>
            <h1 className="truncate typo-body-md-bold text-white">{title}</h1>
            {subtitle ? (
              <p className="truncate typo-caption text-subtle">{subtitle}</p>
            ) : null}
          </>
        ) : null}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open account menu"
          className="ml-1 inline-flex items-center gap-2.5 rounded-lg p-1 pr-3 text-left transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <Avatar className="size-8 ring-1 ring-white/15">
            <AvatarImage src={user?.image ?? undefined} alt="" />
            <AvatarFallback className="bg-white/10 text-xs text-white">
              {initialsFromName(name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate typo-body-sm font-semibold text-white">{name}</span>
            <span className="truncate typo-caption text-subtle">{email}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-56 border-white/10 bg-[#0f0f0f] text-slate-100"
        >
          <DropdownMenuLabel className="text-subtle">Member account</DropdownMenuLabel>
          <DropdownMenuItem disabled className="text-slate-300">
            {email}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
            <Link href="/dashboard/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
            <Link href="/dashboard/billing">Billing</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className="text-red-300 focus:bg-red-500/15 focus:text-red-200"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
