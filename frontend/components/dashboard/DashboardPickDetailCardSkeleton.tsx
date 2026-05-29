import { Skeleton } from "@/components/ui/skeleton";

const darkSkeleton = "bg-white/10";

function TeamSideSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3 px-2">
      <Skeleton className={`size-20 rounded-full sm:size-24 ${darkSkeleton}`} />
      <Skeleton className={`h-4 w-20 max-w-full ${darkSkeleton}`} />
    </div>
  );
}

export function DashboardPickDetailCardSkeleton() {
  return (
    <article
      className="flex h-full min-h-[28rem] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black"
      aria-hidden
    >
      <header className="relative flex min-h-[5.5rem] items-center justify-center border-b border-white/8 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className={`size-14 rounded-full sm:size-16 ${darkSkeleton}`} />
          <Skeleton className={`h-3 w-16 ${darkSkeleton} bg-white/8`} />
        </div>
        <Skeleton
          className={`absolute right-5 top-1/2 h-7 w-28 -translate-y-1/2 rounded-full sm:right-6 ${darkSkeleton}`}
        />
      </header>

      <section className="border-b border-white/8 px-5 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 sm:gap-8">
          <TeamSideSkeleton />
          <Skeleton className={`h-5 w-4 shrink-0 ${darkSkeleton} bg-white/8`} />
          <TeamSideSkeleton />
        </div>
        <div className="mt-5 flex justify-center">
          <Skeleton className={`h-8 w-28 rounded-full ${darkSkeleton}`} />
        </div>
      </section>

      <section className="grid gap-px border-b border-white/8 bg-white/5 sm:grid-cols-2">
        <div className="space-y-2 bg-black/40 px-5 py-4 sm:px-6">
          <Skeleton className={`h-3 w-16 ${darkSkeleton} bg-white/8`} />
          <Skeleton className={`h-4 w-full max-w-[12rem] ${darkSkeleton}`} />
        </div>
        <div className="space-y-2 bg-black/40 px-5 py-4 sm:border-l sm:border-white/8 sm:px-6">
          <Skeleton className={`h-3 w-10 ${darkSkeleton} bg-white/8`} />
          <Skeleton className={`h-4 w-full max-w-[14rem] ${darkSkeleton}`} />
        </div>
      </section>

      <section className="flex flex-1 flex-col space-y-4 px-5 py-5 sm:px-6 sm:py-6">
        <Skeleton className={`h-4 w-36 ${darkSkeleton} bg-white/8`} />
        <div className="space-y-3">
          <Skeleton className={`h-4 w-full ${darkSkeleton}`} />
          <Skeleton className={`h-4 w-full ${darkSkeleton}`} />
          <Skeleton className={`h-4 w-[92%] ${darkSkeleton}`} />
          <Skeleton className={`h-4 w-full ${darkSkeleton} bg-white/8`} />
          <Skeleton className={`h-4 w-[85%] ${darkSkeleton} bg-white/8`} />
        </div>
        <div className="mt-auto space-y-3 border-t border-white/8 pt-4">
          <Skeleton className={`h-3 w-full max-w-md ${darkSkeleton} bg-white/8`} />
          <Skeleton className={`ml-auto h-3 w-32 ${darkSkeleton} bg-white/8`} />
        </div>
      </section>
    </article>
  );
}

export function DashboardPicksGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2"
      aria-busy="true"
      aria-label="Loading picks"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex h-full w-full min-w-0">
          <DashboardPickDetailCardSkeleton />
        </div>
      ))}
    </div>
  );
}
