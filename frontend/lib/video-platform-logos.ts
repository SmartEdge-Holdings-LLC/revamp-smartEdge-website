import type { VideoPlatform } from "@/types/videos";

const VIDEO_PLATFORM_LOGOS: Partial<Record<VideoPlatform, string>> = {
  youtube: "/sports/youtube.svg",
};

export function getVideoPlatformLogo(platform: VideoPlatform): string | undefined {
  return VIDEO_PLATFORM_LOGOS[platform];
}
