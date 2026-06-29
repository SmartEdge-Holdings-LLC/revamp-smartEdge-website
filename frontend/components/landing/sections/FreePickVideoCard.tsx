"use client";

import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import { useEffect } from "react";
import type { PublicVideo } from "@/lib/api/videosApi";
import { getVideoPlatformLogo } from "@/lib/video-platform-logos";
import { VIDEO_PLATFORM_LABELS } from "@/types/videos";
import { cn } from "@/lib/utils";

type FreePickVideoCardProps = {
  video: PublicVideo;
};

function platformBadgeClass(platform: PublicVideo["platform"]) {
  switch (platform) {
    case "youtube":
      return "bg-white/15 text-white ring-0 border-0";
    case "tiktok":
      return "bg-zinc-500/15 text-zinc-200 ring-zinc-400/30";
    case "instagram":
      return "bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-500/30";
    default:
      return "bg-white/10 text-zinc-300 ring-white/20";
  }
}

export function FreePickVideoCard({ video }: FreePickVideoCardProps) {
  const title = video.title.trim() || VIDEO_PLATFORM_LABELS[video.platform];
  const platformLogo = getVideoPlatformLogo(video.platform);

  // Generate embed URL for Instagram if not provided
  const getEmbedUrl = () => {
    if (video.embedUrl) return video.embedUrl;
    if (video.platform === "instagram") {
      return `${video.url}embed`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();
  const isInstagram = video.platform === "instagram";
  const canEmbed = Boolean(embedUrl);

  // Load Instagram embed script
  useEffect(() => {
    if (isInstagram && canEmbed) {
      const script = document.createElement("script");
      script.src = "//www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isInstagram, canEmbed]);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <header className="flex flex-col gap-3 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1",
              platformBadgeClass(video.platform)
            )}
          >
            {platformLogo ? (
              <Image
                src={platformLogo}
                alt=""
                width={18}
                height={18}
                className="size-[18px] shrink-0 object-contain"
              />
            ) : null}
            {VIDEO_PLATFORM_LABELS[video.platform]}
          </span>
          <h3 className="mt-2 text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h3>
        </div>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-white/25 hover:bg-white/10"
        >
          Watch
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </header>

      <section className="px-5 py-5 sm:px-7 sm:py-6">
        {canEmbed ? (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
            {isInstagram ? (
              <blockquote
                className="instagram-media w-full"
                data-instgrm-permalink={video.url}
                data-instgrm-version="14"
              />
            ) : (
              <div className="relative aspect-video w-full">
                <iframe
                  src={embedUrl!}
                  title={title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            )}
          </div>
        ) : (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/3 transition hover:border-accent/40 hover:bg-white/5"
          >
            {platformLogo ? (
              <Image
                src={platformLogo}
                alt=""
                width={56}
                height={56}
                className="size-14 object-contain"
              />
            ) : (
              <span className="flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent ring-2 ring-accent/25">
                <Play className="size-6 fill-current" aria-hidden />
              </span>
            )}
            <span className="text-sm font-medium text-zinc-300">
              Open on {VIDEO_PLATFORM_LABELS[video.platform]}
            </span>
          </a>
        )}
      </section>
    </article>
  );
}
