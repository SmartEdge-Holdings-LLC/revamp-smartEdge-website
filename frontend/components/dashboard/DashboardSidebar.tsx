"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

const MEMBER_NAV: NavItem[] = [
  { title: "Premium picks", url: "/dashboard", icon: LayoutDashboard },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

function isItemActive(pathname: string, url: string) {
  if (url === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname === url || pathname.startsWith(`${url}/`);
}

function SignOutItem() {
  const handleSignOut = () => {
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        onClick={handleSignOut}
        tooltip="Sign out"
        className="h-9 w-full rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
      >
        <LogOut className="size-4 shrink-0" />
        <span className="truncate">Sign out</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname() ?? "/dashboard";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      {...props}
    >
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="h-12 rounded-lg hover:bg-sidebar-accent/40"
              tooltip="SmartEdgePicks"
            >
              <Link href="/dashboard" className="flex items-center justify-center">
                <Image
                  src="/logo.webp"
                  alt="SmartEdgePicks"
                  width={120}
                  height={32}
                  className="h-8 w-auto object-contain group-data-[collapsible=icon]:h-6"
                  priority
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
            Member
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MEMBER_NAV.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(pathname, item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="h-9 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-accent-foreground"
                    >
                      <Link href={item.url}>
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SignOutItem />
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
