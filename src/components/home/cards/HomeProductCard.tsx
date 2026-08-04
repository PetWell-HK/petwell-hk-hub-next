import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getProductComparablePrices,
  roundPrice,
  savingsAmount,
  savingsPct,
} from "@/lib/priceReviewPricing";
import { getPriceReviewProductPath } from "@/lib/priceReviewUrl";
import type { PriceReviewProductSummary } from "@/types/priceReview";
import ProductReviewRatingBadge from "@/components/ProductReviewRatingBadge";

interface HomeProductCardProps {
  product: PriceReviewProductSummary;
}

/** Trip.com-style commerce card — price-forward with savings score pill */
export function HomeProductCard({ product }: HomeProductCardProps) {
  const { t } = useTranslation();
  const pct = savingsPct(product);
  const saved = savingsAmount(product);
  const pricing = getProductComparablePrices(product);

  return (
    <article className="home-card home-card--product group">
      <Link to={getPriceReviewProductPath(product)} className="home-card__link">
        <div className="home-card--product__media">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="home-card--product__img"
            />
          ) : (
            <div className="home-card--product__placeholder" aria-hidden="true" />
          )}
          {pct > 0 && (
            <span className="home-card--product__ribbon">
              {t("homePortal.cards.savePercent", { pct })}
            </span>
          )}
        </div>

        <div className="home-card--product__body">
          <p className="home-card--product__brand">{product.brand}</p>
          <h3 className="home-card--product__name">{product.name}</h3>

          <div className="home-card--product__footer">
            <div className="home-card--product__price-block">
              <p className="home-card--product__price">
                <span className="home-card--product__currency">HK$</span>
                {roundPrice(pricing.lowestPrice)}
              </p>
              {saved > 0 && (
                <span className="home-card--product__struck">HK${roundPrice(pricing.highestPrice)}</span>
              )}
            </div>
            {pct > 0 && (
              <span className="home-card--product__score" aria-label={`慳 ${pct}%`}>
                -{pct}%
              </span>
            )}
          </div>

          <p className="home-card--product__stores">
            <Store className="home-card--product__stores-icon" aria-hidden="true" />
            {t("homePortal.cards.stores", { count: product.storeCount })}
          </p>
          <ProductReviewRatingBadge
            avgRating={product.avgRating}
            numReviews={product.numReviews}
            className="mt-1"
          />
        </div>
      </Link>
    </article>
  );
}
