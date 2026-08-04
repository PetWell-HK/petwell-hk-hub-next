import type { PriceReviewOffer, PriceReviewProductSummary } from "@/types/priceReview";

export function roundPrice(value: number) {
  return Math.round(value * 10) / 10;
}

export function formatPrice(value: number) {
  return `HK$${roundPrice(value).toLocaleString("zh-HK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}`;
}

export function hasUnitPricing(offer: Pick<PriceReviewOffer, "unitPrice">): boolean {
  return typeof offer.unitPrice === "number" && offer.unitPrice > 0;
}

/** Price used for comparison, savings, and sorting. Prefers unit price when available. */
export function getComparablePrice(offer: PriceReviewOffer): number {
  if (hasUnitPricing(offer)) return offer.unitPrice as number;
  return offer.price;
}

export function getOfferDisplayPrice(offer: PriceReviewOffer): number {
  return getComparablePrice(offer);
}

export type ProductComparablePricing = {
  usesUnitPricing: boolean;
  lowestPrice: number;
  highestPrice: number;
  bestOffer: PriceReviewOffer | null;
  worstOffer: PriceReviewOffer | null;
};

export function getProductComparablePrices(
  product: Pick<PriceReviewProductSummary, "topOffers" | "lowestPrice" | "highestPrice">,
): ProductComparablePricing {
  const offers = product.topOffers || [];
  if (offers.length === 0) {
    return {
      usesUnitPricing: false,
      lowestPrice: product.lowestPrice,
      highestPrice: product.highestPrice,
      bestOffer: null,
      worstOffer: null,
    };
  }

  const ranked = offers
    .map((offer) => ({ offer, comparable: getComparablePrice(offer) }))
    .sort((a, b) => a.comparable - b.comparable);

  return {
    usesUnitPricing: offers.some(hasUnitPricing),
    lowestPrice: ranked[0].comparable,
    highestPrice: ranked[ranked.length - 1].comparable,
    bestOffer: ranked[0].offer,
    worstOffer: ranked[ranked.length - 1].offer,
  };
}

export function savingsPct(product: PriceReviewProductSummary): number {
  const { lowestPrice, highestPrice } = getProductComparablePrices(product);
  if (!highestPrice || highestPrice <= lowestPrice) return 0;
  return Math.round(((highestPrice - lowestPrice) / highestPrice) * 100);
}

export function savingsAmount(product: PriceReviewProductSummary): number {
  const { lowestPrice, highestPrice } = getProductComparablePrices(product);
  if (highestPrice <= lowestPrice) return 0;
  return roundPrice(highestPrice - lowestPrice);
}

function formatUnitCount(units: number): string {
  return Number.isInteger(units) ? String(units) : String(roundPrice(units));
}

export function formatPerUnitLabel(offer: PriceReviewOffer): string {
  return offer.priceUnitLabel || offer.priceUnit || "件";
}

/** e.g. 買2瓶 HK$168 — shown when the listed price requires buying multiple units. */
export function formatOfferPurchaseNote(offer: PriceReviewOffer): string | null {
  if (!hasUnitPricing(offer)) return null;
  const units = offer.unitsInPrice ?? 1;
  if (units <= 1) return null;
  const unitWord = offer.priceUnit || "件";
  return `買${formatUnitCount(units)}${unitWord} HK$${roundPrice(offer.price)}`;
}

export function sortOffersByComparablePrice(offers: PriceReviewOffer[]): PriceReviewOffer[] {
  return [...offers].sort((a, b) => getComparablePrice(a) - getComparablePrice(b));
}

export function sortProductsByComparablePrice(
  products: PriceReviewProductSummary[],
  direction: "asc" | "desc",
): PriceReviewProductSummary[] {
  const items = [...products];
  return items.sort((a, b) => {
    const diff = getProductComparablePrices(a).lowestPrice - getProductComparablePrices(b).lowestPrice;
    return direction === "asc" ? diff : -diff;
  });
}
