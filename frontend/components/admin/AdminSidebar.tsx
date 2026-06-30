"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession, readAuthSession } from "@/lib/authCookies";
import type { AppRole } from "@/types/auth";
import {
  CreditCard,
  LayoutDashboard,
  LineChart,
  LogOut,
  PlayCircle,
  Settings,
  ShieldCheck,
  Swords,
  TicketPercent,
  Trophy,
  Users,
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
  SidebarSeparator,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

const PRIMARY_NAV: NavItem[] = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Handicappers", url: "/admin/handicappers", icon: Trophy },
  { title: "Picks", url: "/admin/picks", icon: LineChart },
  { title: "Videos", url: "/admin/videos", icon: PlayCircle },
  { title: "Promotions", url: "/admin/promotions", icon: TicketPercent },
  { title: "Tournaments", url: "/admin/tournaments", icon: Swords },
];

const SYSTEM_NAV: NavItem[] = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const HANDICAPPER_NAV: NavItem[] = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Jonah Subscribers", url: "/admin/handicappers", icon: Trophy },
  { title: "Picks", url: "/admin/picks", icon: LineChart },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

function isItemActive(pathname: string, url: string) {
  if (url === "/admin") return pathname === "/admin";
  return pathname === url || pathname.startsWith(`${url}/`);
}

function SignOutItem() {
  const router = useRouter();

  const handleSignOut = () => {
    clearAuthSession();
    router.push("/login");
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

function NavMenuItems({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return items.map((item) => {
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
  });
}

function NavList({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <SidebarMenu>
      <NavMenuItems items={items} pathname={pathname} />
    </SidebarMenu>
  );
}

function isHandicapperRole(role: AppRole | undefined) {
  return role === "handicapper";
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname() ?? "/admin";
  const [role, setRole] = React.useState<AppRole | undefined>(undefined);

  React.useEffect(() => {
    setRole(readAuthSession()?.role);
  }, []);

  const handicapperOnly = isHandicapperRole(role);
  const homeHref = "/";

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
              tooltip="SmartEdge Admin"
            >
              <Link href={homeHref} className="flex items-center justify-center">
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
        {handicapperOnly ? (
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
              Handicapper
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavList items={HANDICAPPER_NAV} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
                Manage
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <NavList items={PRIMARY_NAV} pathname={pathname} />
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.12em] text-sidebar-foreground/55">
                System
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <NavList items={SYSTEM_NAV} pathname={pathname} />
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
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
