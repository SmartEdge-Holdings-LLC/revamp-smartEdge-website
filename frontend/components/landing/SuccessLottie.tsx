"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const ANIMATION_PATHS = ["/social/Success.json", "/social/success.json"] as const;

export function SuccessLottie({ className }: { className?: string }) {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      for (const path of ANIMATION_PATHS) {
        try {
          const res = await fetch(path);
          if (!res.ok) continue;
          const data = await res.json();
          if (!cancelled) setAnimationData(data);
          return;
        } catch {
          /* try next path */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!animationData) {
    return (
      <div
        className={cn("mx-auto size-36 animate-pulse rounded-full bg-accent/10 ring-1 ring-accent/20", className)}
        aria-hidden
      />
    );
  }

  return (
    <div className={cn("mx-auto", className)} role="img" aria-label="Payment successful">
      <Lottie animationData={animationData} loop={false} className="h-full w-full" />
    </div>
  );
}
