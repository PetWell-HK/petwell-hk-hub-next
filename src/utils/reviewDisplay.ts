import { buildPublicStorageUrl } from "@/utils/forumImageUrl";

/**
 * True when the review came from an imported/external source (not PetWell).
 * First-party sources include "petwell", "petwell-hk-hub", "petwell_*", etc.
 */
export function isExternalReviewSource(source?: string | null): boolean {
  if (!source) return false;
  return !String(source).toLowerCase().startsWith("petwell");
}

export function isPetWellSource(source?: string | null): boolean {
  return !isExternalReviewSource(source);
}

/** Google scrape stores the Maps display name on `title` (no Client row). */
export function importedReviewerName(source?: string | null, title?: string | null): string | null {
  if (!isExternalReviewSource(source)) return null;
  const name = title?.trim();
  return name || null;
}

export function shouldShowReviewTitle(title?: string | null, authorName?: string | null): boolean {
  const heading = title?.trim() || "";
  if (!heading) return false;
  return heading !== (authorName || "").trim();
}

const CJK = /[\u3400-\u9FFF\uF900-\uFAFF]/;

export function reviewAuthorInitials(name: string): string {
  const cleaned = name.replace(/[^\p{L}\p{N}\s]+/gu, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length === 1) {
    const word = parts[0];
    if (CJK.test(word)) return word.slice(0, 1);
    return word.slice(0, 1).toUpperCase();
  }
  const first = parts[0].charAt(0);
  const second = parts[1].charAt(0);
  return `${CJK.test(first) ? first : first.toUpperCase()}${CJK.test(second) ? second : second.toUpperCase()}`;
}

export type ReviewAvatarTone = { bg: string; fg: string };

const AVATAR_TONES: ReviewAvatarTone[] = [
  { bg: "hsl(18 62% 93%)", fg: "hsl(16 58% 32%)" },
  { bg: "hsl(152 28% 90%)", fg: "hsl(156 38% 24%)" },
  { bg: "hsl(198 36% 91%)", fg: "hsl(200 48% 28%)" },
  { bg: "hsl(38 58% 91%)", fg: "hsl(32 52% 30%)" },
  { bg: "hsl(220 22% 91%)", fg: "hsl(222 28% 32%)" },
  { bg: "hsl(8 42% 92%)", fg: "hsl(6 46% 34%)" },
  { bg: "hsl(82 24% 90%)", fg: "hsl(86 32% 26%)" },
  { bg: "hsl(268 18% 92%)", fg: "hsl(270 24% 34%)" },
];

export const ANON_AVATAR_TONE: ReviewAvatarTone = {
  bg: "hsl(24 10% 91%)",
  fg: "hsl(22 8% 40%)",
};

export function reviewAvatarTone(name: string): ReviewAvatarTone {
  const key = name.trim() || "?";
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

/**
 * Resolve a Client.profileImage key or URL to a browser-loadable URL.
 * Profile images are stored under public/client/... (same as the mobile app).
 */
export function resolveProfileImageUrl(profileImage?: string | null): string | null {
  if (!profileImage || typeof profileImage !== "string") return null;
  const cleaned = profileImage.trim();
  if (!cleaned) return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return buildPublicStorageUrl(cleaned);
}
