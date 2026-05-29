"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { FREE_PICKS_SOCIAL_LINKS, type FreePicksSocialPlatform } from "@/components/landing/free-picks-content";
import { FreePickVideoCard } from "@/components/landing/sections/FreePickVideoCard";
import { listPublicVideos } from "@/lib/api/videosApi";
import { getSocialPlatformLogo } from "@/lib/social-platform-logos";
import { cn } from "@/lib/utils";

type FreePicksVideosSectionProps = {
  className?: string;
  /** When true, videos first, then social links; block sits above today's picks */
  showSocial?: boolean;
};

function SocialLinkIcon({ platform }: { platform: FreePicksSocialPlatform }) {
  return (
    <Image
      src={getSocialPlatformLogo(platform)}
      alt=""
      width={24}
      height={24}
      className="size-6 object-contain"
    />
  );
}

function FreePicksSocialRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      {FREE_PICKS_SOCIAL_LINKS.map((link) => (
        <a
          key={link.platform}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group flex min-w-34 flex-col items-center rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-center transition-colors",
            "hover:border-accent/35 hover:bg-white/5"
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10 transition group-hover:bg-accent/10 group-hover:text-accent">
            <SocialLinkIcon platform={link.platform} />
          </span>
          <span className="mt-2 text-sm font-semibold text-white">{link.label}</span>
          <span className="mt-0.5 text-[11px] text-zinc-500">{link.blurb}</span>
        </a>
      ))}
    </div>
  );
}

export function FreePicksVideosSection({
  className,
  showSocial = false,
}: FreePicksVideosSectionProps) {
  const [videos, setVideos] = React.useState<Awaited<ReturnType<typeof listPublicVideos>>["videos"]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listPublicVideos({ page: 1, limit: 12 })
      .then((res) => {
        if (!cancelled) setVideos(res.videos);
      })
      .catch((err) => {
        if (!cancelled) {
          setVideos([]);
          setError(err instanceof Error ? err.message : "Could not load videos");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasVideos = videos.length > 0;
  const showBlock = showSocial || loading || error || hasVideos;

  if (!showBlock) {
    return null;
  }

  return (
    <div
      className={cn(
        showSocial ? "mt-10" : "mt-14 border-t border-white/10 pt-10",
        className
      )}
    >
      <div className="text-center">
        <h2 className="text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
          {showSocial ? "Watch & follow" : "Featured videos"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {showSocial
            ? "Watch the latest card breakdowns from our team"
            : "Active picks breakdowns and analysis from our team"}
        </p>
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-accent" aria-label="Loading videos" />
        </div>
      ) : error ? (
        <p className="mt-8 text-center text-sm text-red-400/90">{error}</p>
      ) : hasVideos ? (
        <div className="mt-8 space-y-8">
          {videos.map((video) => (
            <FreePickVideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : showSocial ? (
        <p className="mt-8 text-center text-sm text-zinc-500">
          New video breakdowns are posted regularly — check back soon.
        </p>
      ) : null}

      {showSocial ? (
        <div className="mt-10 border-t border-white/10 pt-10">
          <p className="mb-6 text-center text-sm text-zinc-500">Follow for daily picks updates</p>
          <FreePicksSocialRow />
        </div>
      ) : null}
    </div>
  );
}
