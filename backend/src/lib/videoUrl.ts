export const VIDEO_PLATFORMS = ["youtube", "tiktok", "instagram"] as const;

export type VideoPlatform = (typeof VIDEO_PLATFORMS)[number];

export type ParsedVideoUrl = {
  platform: VideoPlatform;
  /** Normalized share URL (https, trimmed). */
  url: string;
  /** Platform-specific id when extractable (YouTube video id, TikTok video id, Instagram shortcode). */
  externalId: string | null;
};

function tryUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function parseYouTube(u: URL, raw: string): ParsedVideoUrl | null {
  const host = u.hostname.replace(/^www\./, "");
  let externalId: string | null = null;

  if (host === "youtu.be") {
    externalId = u.pathname.slice(1).split("/")[0] || null;
  } else if (host === "youtube.com" || host === "m.youtube.com") {
    if (u.pathname.startsWith("/watch")) {
      externalId = u.searchParams.get("v");
    } else if (u.pathname.startsWith("/shorts/")) {
      externalId = u.pathname.split("/")[2] ?? null;
    } else if (u.pathname.startsWith("/embed/")) {
      externalId = u.pathname.split("/")[2] ?? null;
    }
  }

  if (!externalId) return null;
  return {
    platform: "youtube",
    url: raw,
    externalId,
  };
}

function parseTikTok(u: URL, raw: string): ParsedVideoUrl | null {
  const host = u.hostname.replace(/^www\./, "");
  if (!host.includes("tiktok.com")) return null;

  const match = u.pathname.match(/\/video\/(\d+)/);
  const externalId = match?.[1] ?? null;

  return {
    platform: "tiktok",
    url: raw,
    externalId,
  };
}

function parseInstagram(u: URL, raw: string): ParsedVideoUrl | null {
  const host = u.hostname.replace(/^www\./, "");
  if (!host.includes("instagram.com")) return null;

  const reelMatch = u.pathname.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
  const externalId = reelMatch?.[1] ?? null;

  return {
    platform: "instagram",
    url: raw,
    externalId,
  };
}

/**
 * Validates a YouTube, TikTok, or Instagram video/reel URL.
 * @throws Error with a user-facing message when invalid.
 */
export function parseVideoUrl(input: string): ParsedVideoUrl {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Video URL is required");
  }

  const u = tryUrl(trimmed);
  if (!u) {
    throw new Error("Enter a valid video link");
  }

  const normalized = u.href;

  const parsed =
    parseYouTube(u, normalized) ??
    parseTikTok(u, normalized) ??
    parseInstagram(u, normalized);

  if (!parsed) {
    throw new Error(
      "Unsupported link. Use a public YouTube, TikTok, or Instagram reel/post URL."
    );
  }

  return parsed;
}

export function embedUrlForVideo(
  platform: VideoPlatform,
  url: string,
  externalId: string | null
): string | null {
  if (platform === "youtube" && externalId) {
    return `https://www.youtube.com/embed/${externalId}`;
  }
  return null;
}
