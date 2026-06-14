import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAuthTokenExpired, loginRedirectPath } from "@/lib/authSession";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata = {
  title: "SmartEdgePicks · Dashboard",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const token = session?.user?.backendToken;
  if (!session?.user || !token || isAuthTokenExpired(token)) {
    redirect(loginRedirectPath("/dashboard"));
  }

  return (
    <div className="dark min-h-svh bg-black text-slate-100">
      <SidebarProvider defaultOpen>
        <DashboardSidebar />
        <SidebarInset className="flex min-h-svh min-w-0 flex-col overflow-x-hidden bg-black">
          <DashboardShell user={session.user}>{children}</DashboardShell>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
