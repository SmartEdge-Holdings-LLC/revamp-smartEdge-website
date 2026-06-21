export const Skeleton = ({ className = "h-4 w-full" }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-white/10 ${className}`} />
);
