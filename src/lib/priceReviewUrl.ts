import type { PriceReviewProduct, PriceReviewProductSummary } from "@/types/priceReview";

const SITE_URL = "https://petwellhk.com";

type PriceReviewProductLink = Pick<PriceReviewProduct | PriceReviewProductSummary, "id">;

export function getPriceReviewProductPath(product: PriceReviewProductLink) {
  return `/review/${encodeURIComponent(product.id)}/`;
}

export function getPriceReviewProductUrl(product: PriceReviewProductLink) {
  return `${SITE_URL}${getPriceReviewProductPath(product)}`;
}
