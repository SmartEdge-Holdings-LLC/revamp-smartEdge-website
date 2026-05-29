import type { ReactNode } from "react";
import { AdminAccessGuard } from "@/components/admin/AdminAccessGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata = {
  title: "SmartEdgePicks · Admin",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
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
