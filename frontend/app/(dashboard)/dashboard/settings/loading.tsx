import { DashboardHeaderSkeleton } from "@/components/dashboard/DashboardHeaderSkeleton";
import { DashboardSettingsSkeleton } from "@/components/dashboard/DashboardSettingsSkeleton";

export default function SettingsLoading() {
  return (
    <>
      <DashboardHeaderSkeleton />
      <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
        <DashboardSettingsSkeleton />
      </div>
    </>
  );
}
