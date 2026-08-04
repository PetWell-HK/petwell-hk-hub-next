import type { PlaceReviewType } from "@/types/placeReview";

const PLACE_REVIEW_DRAFT_KEY = "petwell.placeReview.draft";

export type PlaceReviewDraft = {
  placeType: PlaceReviewType;
  placeId: string;
  rating: number;
  title: string;
  description: string;
  anonymous: boolean;
  showTitle: boolean;
};

export function savePlaceReviewDraft(draft: PlaceReviewDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PLACE_REVIEW_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore quota / private-mode failures; in-memory restore still works for in-panel auth.
  }
}

export function readPlaceReviewDraft(): PlaceReviewDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PLACE_REVIEW_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlaceReviewDraft>;
    if (
      typeof parsed.placeType !== "string" ||
      typeof parsed.placeId !== "string" ||
      typeof parsed.rating !== "number" ||
      typeof parsed.description !== "string"
    ) {
      return null;
    }
    return {
      placeType: parsed.placeType as PlaceReviewType,
      placeId: parsed.placeId,
      rating: parsed.rating,
      title: typeof parsed.title === "string" ? parsed.title : "",
      description: parsed.description,
      anonymous: Boolean(parsed.anonymous),
      showTitle: Boolean(parsed.showTitle),
    };
  } catch {
    return null;
  }
}

export function clearPlaceReviewDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PLACE_REVIEW_DRAFT_KEY);
  } catch {
    // no-op
  }
}

export function readMatchingPlaceReviewDraft(
  placeType: PlaceReviewType,
  placeId: string,
): PlaceReviewDraft | null {
  const draft = readPlaceReviewDraft();
  if (!draft) return null;
  if (draft.placeType !== placeType || draft.placeId !== placeId) return null;
  return draft;
}
