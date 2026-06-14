import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminAccessGuard } from "@/components/admin/AdminAccessGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { loginRedirectPath } from "@/lib/authSession";
import { getServerAdminAuthSession } from "@/lib/serverAuthSession";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata = {
  title: "SmartEdgePicks · Admin",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerAdminAuthSession();
  if (!session) {
    redirect(loginRedirectPath("/admin"));
  }
  return (
    <div className="dark min-h-svh bg-black text-slate-100">
      <SidebarProvider defaultOpen>
        <AdminAccessGuard>
          <AdminSidebar />
          <SidebarInset className="bg-black">{children}</SidebarInset>
        </AdminAccessGuard>
      </SidebarProvider>
    </div>
  );
}
