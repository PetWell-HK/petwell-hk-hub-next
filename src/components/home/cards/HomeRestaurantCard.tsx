import { Link } from "react-router-dom";
import { MapPin, Banknote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RestaurantImage } from "@/components/RestaurantImage";
import type { Restaurant } from "@/services/restaurantApi";

interface HomeRestaurantCardProps {
  restaurant: Restaurant;
  rank?: number;
}

/** OpenRice-style chart card — full-bleed photo with optional rank badge and overlay */
export function HomeRestaurantCard({ restaurant, rank }: HomeRestaurantCardProps) {
  const { t } = useTranslation();
  const rating = restaurant.rating && restaurant.rating > 0 ? restaurant.rating : null;

  return (
    <article className="home-card home-card--restaurant-chart group">
      <Link to={`/restaurants/${restaurant.id}`} className="home-card__link">
        <div className="home-card--restaurant-chart__media">
          <RestaurantImage
            imageKey={restaurant.image}
            alt={restaurant.name}
            className="home-card--restaurant-chart__img"
          />
          {rank !== undefined && (
            <span
              className="home-card--restaurant-chart__rank"
              aria-label={t("homePortal.cards.rank", { rank })}
            >
              {rank}
            </span>
          )}
          {rating !== null && (
            <span className="home-card--restaurant-chart__score">{rating.toFixed(1)}</span>
          )}
          <div className="home-card--restaurant-chart__overlay">
            <h3 className="home-card--restaurant-chart__name">{restaurant.name}</h3>
            {(restaurant.typeLabels || restaurant.priceRange) && (
              <p className="home-card--restaurant-chart__meta">
                {restaurant.typeLabels}
                {restaurant.typeLabels && restaurant.priceRange ? " · " : ""}
                {restaurant.priceRange && (
                  <span className="inline-flex items-center gap-0.5">
                    <Banknote className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
                    {restaurant.priceRange}
                  </span>
                )}
              </p>
            )}
            <p className="home-card--restaurant-chart__district">
              <MapPin className="home-card--restaurant-chart__pin" aria-hidden="true" />
              {restaurant.district}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
