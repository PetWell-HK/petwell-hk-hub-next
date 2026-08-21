import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import { MapPin, Star, TriangleAlert } from "lucide-react";
import { RestaurantImage } from "@/components/RestaurantImage";
import { RestaurantVerificationBadge } from "@/components/RestaurantVerificationBadge";
import { PremiumPartnerBadge } from "@/components/PremiumPartnerBadge";
import { isEffectivePremium } from "@/utils/partnerPremium";
import type { Restaurant } from "@/services/restaurantApi";

interface NearbyRestaurantCardProps {
  restaurant: Restaurant;
  distanceKm: number;
}

function formatDistance(km: number, t: (key: string, opts?: Record<string, unknown>) => string) {
  if (km < 1) {
    return t("restaurants.detail.nearbyDistanceM", { m: Math.round(km * 1000) });
  }
  return t("restaurants.detail.nearbyDistanceKm", { km: km.toFixed(1) });
}

export function NearbyRestaurantCard({ restaurant, distanceKm }: NearbyRestaurantCardProps) {
  const { t } = useTranslation();

  const petAccessLabel =
    restaurant.petAccessArea === "INDOOR_ALLOWED"
      ? t("restaurant.petAccessArea.indoorAllowed")
      : restaurant.petAccessArea === "OUTDOOR_ONLY"
        ? t("restaurant.petAccessArea.outdoorOnly")
        : null;

  const petEntryLabel =
    restaurant.petEntryPolicy === "WALK_IN_ONLY"
      ? t("restaurant.petEntryPolicy.walkInOnly")
      : restaurant.petEntryPolicy === "RESERVATION_REQUIRED"
        ? t("restaurant.petEntryPolicy.reservationRequired")
        : restaurant.petEntryPolicy === "BOTH"
          ? t("restaurant.petEntryPolicy.both")
          : null;

  const policyChips = [petAccessLabel, petEntryLabel].filter(Boolean) as string[];

  return (
    <article className="nearby-restaurant-card group h-full">
      <AppLink
        href={`/restaurants/${restaurant.id}`}
        className="flex h-full flex-col overflow-hidden rounded-xl border border-[hsl(var(--restaurant-line))] bg-[hsl(var(--restaurant-panel))] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[5/3] overflow-hidden bg-muted">
          <RestaurantImage
            imageKey={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1.5">
            {isEffectivePremium(restaurant) && (
              <PremiumPartnerBadge variant="onDark" />
            )}
            <RestaurantVerificationBadge
              verified={restaurant.verified}
              fehdLicensed={restaurant.fehdLicensed}
              listingAlert={restaurant.listingAlert}
              externalMetadata={restaurant.externalMetadata}
              variant="onDark"
            />
          </div>
          <span className="absolute right-2 top-2 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
            {formatDistance(distanceKm, t)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <header className="min-w-0 space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary md:text-[15px]">
              {restaurant.name}
            </h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
              <span className="line-clamp-1">{restaurant.district}</span>
            </p>
          </header>

          {restaurant.listingAlert && (
            <span className="inline-flex w-fit items-center gap-1 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">
              <TriangleAlert className="h-3 w-3 shrink-0" aria-hidden />
              {t("restaurant.notPetFriendly")}
            </span>
          )}

          {(policyChips.length > 0 || (restaurant.rating != null && restaurant.rating > 0)) && (
            <div className="mt-auto flex flex-wrap items-center gap-1.5">
              {policyChips.slice(0, 2).map((label) => (
                <span
                  key={label}
                  className="inline-flex max-w-full truncate rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-foreground/75"
                >
                  {label}
                </span>
              ))}
              {restaurant.rating != null && restaurant.rating > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground">
                  <Star className="h-3 w-3 fill-primary text-primary" aria-hidden />
                  {restaurant.rating.toFixed(1)}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </AppLink>
    </article>
  );
}
