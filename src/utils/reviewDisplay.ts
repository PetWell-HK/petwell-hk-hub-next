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
