import AppLink from "@/components/AppLink";
import { Store } from "lucide-react";
import { ReviewProductPrice } from "@/components/ReviewPriceDisplay";
import {
  getProductComparablePrices,
  roundPrice,
  savingsAmount,
  savingsPct,
} from "@/lib/priceReviewPricing";
import { getPriceReviewProductPath } from "@/lib/priceReviewUrl";
import type { PriceReviewProductSummary } from "@/types/priceReview";
import ProductReviewRatingBadge from "@/components/ProductReviewRatingBadge";

interface ReviewProductSummaryCardProps {
  product: PriceReviewProductSummary;
}

export function ReviewProductSummaryCard({ product }: ReviewProductSummaryCardProps) {
  const pct = savingsPct(product);
  const saved = savingsAmount(product);
  const pricing = getProductComparablePrices(product);

  return (
    <article className="review-panel review-card-product group flex h-full flex-col overflow-hidden bg-white">
      <AppLink
        href={getPriceReviewProductPath(product)}
        className="relative block aspect-square bg-[hsl(var(--review-canvas))]/40 p-2.5"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">—</div>
        )}
        {pct > 0 && (
          <span className="review-savings-pill absolute left-2 top-2 rounded-sm px-1.5 py-0.5 text-[10px] leading-none">
            慳{pct}%
          </span>
        )}
      </AppLink>

      <div className="flex flex-1 flex-col gap-1 p-2.5 pt-2">
        <AppLink
          href={`/review/brand/${encodeURIComponent(product.brand)}`}
          className="truncate text-[11px] font-medium text-primary hover:underline"
        >
          {product.brand}
        </AppLink>
        <AppLink href={getPriceReviewProductPath(product)}>
          <h3 className="line-clamp-2 min-h-[2.25rem] text-[12px] leading-snug text-foreground group-hover:text-primary">
            {product.name}
          </h3>
        </AppLink>

        <div className="mt-auto space-y-1 pt-1">
          <ReviewProductPrice product={product} />
          {saved > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="review-price-struck">HK${roundPrice(pricing.highestPrice)}</span>
              <span className="text-[10px] font-medium text-primary">慳 HK${saved}</span>
            </div>
          )}
          <p className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
            <Store className="h-3 w-3 shrink-0" />
            {product.storeCount} 間
          </p>
          <ProductReviewRatingBadge avgRating={product.avgRating} numReviews={product.numReviews} />
        </div>
      </div>
    </article>
  );
}
