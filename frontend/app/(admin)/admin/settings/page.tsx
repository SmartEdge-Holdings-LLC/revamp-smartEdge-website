import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSettingsSmsForm } from "@/components/admin/AdminSettingsSmsForm";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminHeader title="Settings" subtitle="Manage admin notification actions" />
      <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
        <AdminSettingsSmsForm />
      </div>
    </>
  );
}