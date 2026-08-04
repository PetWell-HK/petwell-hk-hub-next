const PRODUCT_REVIEW_DRAFT_KEY = "petwell.productReview.draft";

export type ProductReviewDraft = {
  productId: string;
  rating: number;
  title: string;
  description: string;
  anonymous: boolean;
  showTitle: boolean;
};

export function saveProductReviewDraft(draft: ProductReviewDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PRODUCT_REVIEW_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore quota / private-mode failures; in-memory restore still works for in-panel auth.
  }
}

export function readProductReviewDraft(): ProductReviewDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PRODUCT_REVIEW_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProductReviewDraft>;
    if (
      typeof parsed.productId !== "string" ||
      typeof parsed.rating !== "number" ||
      typeof parsed.description !== "string"
    ) {
      return null;
    }
    return {
      productId: parsed.productId,
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

export function clearProductReviewDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PRODUCT_REVIEW_DRAFT_KEY);
  } catch {
    // no-op
  }
}

export function readMatchingProductReviewDraft(productId: string): ProductReviewDraft | null {
  const draft = readProductReviewDraft();
  if (!draft) return null;
  if (draft.productId !== productId) return null;
  return draft;
}
