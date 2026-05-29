import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingAccentButtonProps {
  children: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
  className?: string;
}

export function PricingAccentButton({
  children,
  href,
  onClick,
  disabled,
  loading,
  type = "button",
  fullWidth = true,
  className,
}: PricingAccentButtonProps) {
  const styles = cn(
    "pricing-accent-gradient group inline-flex items-center justify-between gap-3 rounded-full px-5 py-3.5 text-[15px] font-medium text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99]",
    fullWidth ? "w-full" : "w-auto",
    (disabled || loading) && "pointer-events-none opacity-60",
    className
  );

  const content = (
    <>
      <span>{loading ? "Processing…" : children}</span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/25 ring-1 ring-white/20 transition-transform group-hover:translate-x-0.5">
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" strokeWidth={2} />
        )}
      </span>
    </>
  );

  if (href && !onClick) {
    return (
      <Link href={href} className={styles} aria-disabled={disabled}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={styles} onClick={onClick} disabled={disabled || loading}>
      {content}
    </button>
  );
}
