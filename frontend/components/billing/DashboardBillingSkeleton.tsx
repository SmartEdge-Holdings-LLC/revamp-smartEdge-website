import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const darkSkeleton = "bg-white/10";

function BillingNavItemSkeleton() {
  return (
    <div className="flex w-full items-center gap-3 px-1 py-1" aria-hidden>
      <Skeleton className={`size-9 shrink-0 rounded-md ${darkSkeleton}`} />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <Skeleton className={`h-4 w-32 max-w-full ${darkSkeleton}`} />
        <Skeleton className={`h-3 w-48 max-w-full ${darkSkeleton} bg-white/8`} />
      </div>
    </div>
  );
}

const BILLING_TAB_LABELS = ["Overview", "Payment methods", "Billing history"] as const;

function BillingPageHeaderSkeleton() {
  return (
    <div className="max-w-4xl text-left">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Billing</h1>
      <nav
        className="mt-4 flex flex-wrap justify-start gap-x-8 gap-y-1 border-b border-white/10"
        aria-label="Billing sections"
        aria-busy="true"
      >
        {BILLING_TAB_LABELS.map((label, index) => {
          const isActive = index === 0;
          return (
            <span
              key={label}
              className={cn(
                "relative -mb-px pb-3 text-sm",
                isActive ? "text-white" : "text-zinc-500"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
              {isActive ? (
                <span className="absolute inset-x-0 bottom-0 h-px bg-white" aria-hidden />
              ) : null}
            </span>
          );
        })}
      </nav>
    </div>
  );
}

/** Skeleton for the Overview tab — mirrors DashboardBilling layout. */
export function DashboardBillingSkeleton() {
  return (
    <div className="w-full">
      <BillingPageHeaderSkeleton />

      <div className="mx-auto mt-16 w-full max-w-4xl">
        <div className="space-y-10">
          <section>
            <Skeleton className={`h-4 w-36 ${darkSkeleton} bg-white/8`} />

            <div className="mt-8 space-y-6">
              <Skeleton className={`h-4 w-44 max-w-full ${darkSkeleton} bg-white/8`} />
              <div className="space-y-2">
                <Skeleton className={`h-12 w-40 max-w-full sm:w-52 ${darkSkeleton}`} />
                <Skeleton className={`h-8 w-56 max-w-full sm:w-64 ${darkSkeleton} bg-white/8`} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Skeleton className={`h-9 w-36 rounded-full ${darkSkeleton}`} />
              <Skeleton className={`h-9 w-40 rounded-full ${darkSkeleton}`} />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <BillingNavItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
