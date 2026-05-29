"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { clearAuthSession, readAuthSession } from "@/lib/authCookies";
import type { AppRole } from "@/types/auth";
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

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

function formatRole(role: AppRole) {
  switch (role) {
    case "superadmin":
      return "Super Admin";
    case "subadmin":
      return "Sub Admin";
    case "admin":
      return "Admin";
    case "handicapper":
      return "Handicapper";
    case "member":
      return "Member";
    default:
      return role;
  }
}

function initialsFromEmail(email: string) {
  const local = email.split("@")[0]?.trim() ?? "";
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return local[0]?.toUpperCase() ?? "AD";
}

export function AdminHeader({ title = "Dashboard", subtitle }: AdminHeaderProps) {
  const [session, setSession] = React.useState<ReturnType<typeof readAuthSession>>(null);
  const router = useRouter();

  React.useEffect(() => {
    setSession(readAuthSession());
  }, []);

  const roleLabel = session ? formatRole(session.role) : "—";
  const email = session?.email ?? "—";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/10 bg-sidebar px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="hidden h-6 sm:block" />

      <div className="min-w-0 flex-1">
        <h1 className="truncate typo-body-md-bold text-white">{title}</h1>
        {subtitle ? <p className="truncate typo-caption text-subtle">{subtitle}</p> : null}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open account menu"
          className="ml-1 inline-flex items-center gap-2.5 rounded-lg p-1 pr-3 text-left transition hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <Avatar className="size-8">
            <AvatarImage src="" alt="" />
            <AvatarFallback>{session ? initialsFromEmail(session.email) : "AD"}</AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate typo-body-sm font-semibold text-white">{roleLabel}</span>
            <span className="truncate typo-caption text-subtle">{email}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel className="text-subtle">Signed in as {roleLabel}</DropdownMenuLabel>
          <DropdownMenuItem disabled>{email}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/admin/settings?tab=profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/admin/settings?tab=security")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              clearAuthSession();
              router.push("/login");
            }}
            className="text-red-300 focus:bg-red-500/15 focus:text-red-200"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
