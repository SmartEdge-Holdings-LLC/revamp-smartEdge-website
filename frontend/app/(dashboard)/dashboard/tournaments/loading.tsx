import { Skeleton } from "@/components/ui/skeleton";

export default function TournamentsLoading() {
  return (
    <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
      <Skeleton className="h-9 w-52 bg-white/10" />
      <div className="mt-4 flex gap-8 border-b border-white/10 pb-3">
        <Skeleton className="h-4 w-32 bg-white/10" />
        <Skeleton className="h-4 w-28 bg-white/10" />
        <Skeleton className="h-4 w-28 bg-white/10" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}
