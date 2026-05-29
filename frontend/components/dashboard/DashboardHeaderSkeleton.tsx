import { Skeleton } from "@/components/ui/skeleton";

const darkSkeleton = "bg-white/10";

export function DashboardHeaderSkeleton() {
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
