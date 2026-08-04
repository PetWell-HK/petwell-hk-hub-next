import type { PriceReviewOffer, PriceReviewProductSummary } from "@/types/priceReview";
import {
  formatOfferPurchaseNote,
  formatPerUnitLabel,
  getOfferDisplayPrice,
  getProductComparablePrices,
  hasUnitPricing,
  roundPrice,
} from "@/lib/priceReviewPricing";
import { cn } from "@/lib/utils";

type PriceSize = "xs" | "sm" | "md" | "lg";

const VALUE_CLASS: Record<PriceSize, string> = {
  xs: "text-[14px]",
  sm: "text-[15px]",
  md: "text-[18px]",
  lg: "text-[26px]",
};

export function ReviewPriceAmount({
  amount,
  size = "sm",
  highlight,
  className,
}: {
  amount: number;
  size?: PriceSize;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("review-price", highlight && "text-primary", className)}>
      <span className="review-price-symbol">HK$</span>
      <span className={cn("review-price-value font-bold leading-none", VALUE_CLASS[size])}>
        {roundPrice(amount)}
      </span>
    </p>
  );
}

export function ReviewProductPrice({
  product,
  size = "sm",
  highlight,
  showPurchaseNote = true,
  className,
}: {
  product: PriceReviewProductSummary;
  size?: PriceSize;
  highlight?: boolean;
  showPurchaseNote?: boolean;
  className?: string;
}) {
  const pricing = getProductComparablePrices(product);
  const purchaseNote = pricing.bestOffer && showPurchaseNote
    ? formatOfferPurchaseNote(pricing.bestOffer)
    : null;
  const perUnitLabel = pricing.bestOffer && pricing.usesUnitPricing && !purchaseNote
    ? formatPerUnitLabel(pricing.bestOffer)
    : null;

  return (
    <div className={className}>
      <ReviewPriceAmount amount={pricing.lowestPrice} size={size} highlight={highlight} />
      {purchaseNote ? (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{purchaseNote}</p>
      ) : null}
      {perUnitLabel ? (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{perUnitLabel}</p>
      ) : null}
    </div>
  );
}

export function ReviewOfferPrice({
  offer,
  highlight,
  className,
}: {
  offer: PriceReviewOffer;
  highlight?: boolean;
  className?: string;
}) {
  const displayPrice = getOfferDisplayPrice(offer);
  const purchaseNote = formatOfferPurchaseNote(offer);
  const unitSuffix = hasUnitPricing(offer) ? (offer.priceUnit || "件") : null;
  const perUnitLabel = hasUnitPricing(offer) && !purchaseNote ? formatPerUnitLabel(offer) : null;

  return (
    <div className={cn("text-right", className)}>
      <p className={cn("review-price text-[15px] md:text-[16px]", highlight && "text-primary")}>
        <span className="review-price-symbol text-[10px]">HK$</span>
        <span className="review-price-value text-[15px] font-bold md:text-[16px]">
          {roundPrice(displayPrice).toLocaleString("zh-HK", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          })}
        </span>
        {unitSuffix ? (
          <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">/{unitSuffix}</span>
        ) : null}
        {!unitSuffix && perUnitLabel ? (
          <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">/{perUnitLabel}</span>
        ) : null}
      </p>
      {purchaseNote ? (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{purchaseNote}</p>
      ) : null}
    </div>
  );
}
