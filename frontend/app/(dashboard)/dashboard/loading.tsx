import { DashboardPicksGridSkeleton } from "@/components/dashboard/DashboardPickDetailCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const darkSkeleton = "bg-white/10";

function DashboardHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-sidebar px-4 backdrop-blur-xl md:px-6">
      <Skeleton className={`size-8 rounded-lg ${darkSkeleton}`} />
      <Skeleton className={`hidden h-6 w-px sm:block ${darkSkeleton}`} />
      <div className="min-w-0 flex-1" />
      <Skeleton className={`hidden size-8 rounded-full sm:block ${darkSkeleton}`} />
      <Skeleton className={`hidden h-8 w-24 rounded-lg sm:block ${darkSkeleton} bg-white/8`} />
    </header>
  );
}

export default function DashboardLoading() {
  return (
    <>
      <DashboardHeaderSkeleton />
      <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
        <div className="w-full">
          <div className="max-w-4xl text-left">
            <Skeleton className={`h-9 w-40 ${darkSkeleton}`} />
            <div className="mt-4 flex flex-wrap justify-start gap-8 border-b border-white/10 pb-3">
              <Skeleton className={`h-4 w-28 ${darkSkeleton}`} />
              <Skeleton className={`h-4 w-24 ${darkSkeleton} bg-white/8`} />
            </div>
          </div>

          <div className="mt-16 w-full">
            <DashboardPicksGridSkeleton count={4} />
          </div>
        </div>
      </div>
    </>
  );
}
