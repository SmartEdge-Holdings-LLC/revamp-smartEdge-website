import { AdminDashboardPage } from "@/components/admin/AdminDashboardPage";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminPage() {
  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="Platform metrics — full admin or Jonah-only for handicappers"
      />
      <AdminDashboardPage />
    </>
  );
}
