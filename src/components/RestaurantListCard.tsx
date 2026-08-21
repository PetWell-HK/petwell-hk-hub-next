import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import { MapPin, Star, DoorOpen, CalendarCheck, Coffee, Clock, UtensilsCrossed, Banknote, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RestaurantImage } from "@/components/RestaurantImage";
import { RestaurantVerificationBadge } from "@/components/RestaurantVerificationBadge";
import { PremiumPartnerBadge } from "@/components/PremiumPartnerBadge";
import { isEffectivePremium } from "@/utils/partnerPremium";
import type { Restaurant } from "@/services/restaurantApi";

interface RestaurantListCardProps {
  restaurant: Restaurant;
  petAccessLabel: string | null;
  petEntryLabel: string | null;
  openingHoursText: string | null;
}

export function RestaurantListCard({
  restaurant,
  petAccessLabel,
  petEntryLabel,
  openingHoursText,
}: RestaurantListCardProps) {
  const { t } = useTranslation();

  return (
    <article>
      <AppLink href={`/restaurants/${restaurant.id}`}>
        <Card className="h-full overflow-hidden hover:shadow-strong transition-shadow cursor-pointer rounded-xl">
          <div className="relative aspect-[4/3] overflow-hidden">
            <RestaurantImage
              imageKey={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full"
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
          </div>

          <div className="p-4 space-y-3">
            <header>
              <h2 className="text-lg font-bold line-clamp-1">{restaurant.name}</h2>
              {(restaurant.typeLabels || restaurant.priceRange) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  {restaurant.typeLabels && (
                    <span className="inline-flex items-center gap-1 line-clamp-1">
                      <UtensilsCrossed className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      {restaurant.typeLabels}
                    </span>
                  )}
                  {restaurant.priceRange && (
                    <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                      <Banknote className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      {restaurant.priceRange}
                    </span>
                  )}
                </div>
              )}
            </header>

            {restaurant.listingAlert && (
              <Badge
                variant="outline"
                className="border-red-200 bg-red-50 text-red-700 font-semibold text-xs px-2 py-1 rounded-xl"
              >
                <TriangleAlert className="w-3 h-3 mr-1" />
                {t("restaurant.notPetFriendly")}
              </Badge>
            )}

            {restaurant.puppuccino && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-[#E8F5E9] text-[#2E7D32] font-bold text-xs px-2 py-1 rounded-xl"
                >
                  <Coffee className="w-3 h-3 mr-1" />
                  Puppuccino
                </Badge>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {petAccessLabel && (
                <Badge variant="outline" className="text-xs">
                  <DoorOpen className="w-3 h-3 mr-1" />
                  {petAccessLabel}
                </Badge>
              )}
              {petEntryLabel && (
                <Badge variant="outline" className="text-xs">
                  <CalendarCheck className="w-3 h-3 mr-1" />
                  {petEntryLabel}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{restaurant.district}</span>
              </div>
              {restaurant.rating && restaurant.rating > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                </div>
              ) : null}
            </div>

            <address className="flex items-start gap-2 text-muted-foreground not-italic text-sm">
              <span className="line-clamp-2">{restaurant.address}</span>
            </address>

            {openingHoursText && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>{openingHoursText}</span>
              </div>
            )}
          </div>
        </Card>
      </AppLink>
    </article>
  );
}
