import { DashboardBillingSkeleton } from "@/components/billing/DashboardBillingSkeleton";
import { DashboardHeaderSkeleton } from "@/components/dashboard/DashboardHeaderSkeleton";

export default function BillingLoading() {
  return (
    <>
      <DashboardHeaderSkeleton />
      <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
        <DashboardBillingSkeleton />
      </div>
    </>
  );
}
