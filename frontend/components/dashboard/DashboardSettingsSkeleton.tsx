import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const darkSkeleton = "bg-white/10";

const SETTINGS_TAB_LABELS = ["User", "Security"] as const;

function SettingsPageHeaderSkeleton() {
  return (
    <div className="max-w-4xl text-left">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Profile</h1>
      <nav
        className="mt-4 flex justify-start gap-8 border-b border-white/10"
        aria-label="Profile sections"
        aria-busy="true"
      >
        {SETTINGS_TAB_LABELS.map((label, index) => {
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

function FieldSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className={`h-4 w-16 ${darkSkeleton}`} />
      <Skeleton className={`mt-1.5 h-3 w-56 max-w-full ${darkSkeleton} bg-white/8`} />
      <Skeleton className={`mt-1.5 h-10 w-full rounded-md ${darkSkeleton}`} />
    </div>
  );
}

/** Skeleton for the User tab — mirrors DashboardSettingsProfileForm layout. */
export function DashboardSettingsSkeleton() {
  return (
    <div className="w-full">
      <SettingsPageHeaderSkeleton />

      <div className="mx-auto mt-16 grid w-full max-w-4xl grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton className="md:col-span-2" />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <div className="flex justify-center md:col-span-2">
          <Skeleton className={`h-9 w-16 rounded-md ${darkSkeleton} bg-white/20`} />
        </div>
      </div>
    </div>
  );
}
