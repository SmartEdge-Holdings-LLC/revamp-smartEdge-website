import type { FreePicksSocialPlatform } from "@/components/landing/free-picks-content";

/** Brand marks in `public/social/` */
const SOCIAL_PLATFORM_LOGOS: Record<FreePicksSocialPlatform, string> = {
  youtube: "/social/youtube.png",
  instagram: "/social/instagram.png",
  tiktok: "/social/tik-tok.png",
};

export function getSocialPlatformLogo(platform: FreePicksSocialPlatform): string {
  return SOCIAL_PLATFORM_LOGOS[platform];
}
