import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminPage() {
  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Platform metrics from users and Stripe" />
      <AdminDashboard />
    </>
  );
}
