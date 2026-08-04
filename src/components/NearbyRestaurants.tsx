import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, MapPin, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NearbyRestaurantCard } from "@/components/restaurant/NearbyRestaurantCard";
import { useNearbyRestaurants } from "@/hooks/useNearbyRestaurants";
import { cn } from "@/lib/utils";

interface NearbyRestaurantsProps {
  eventLat?: number;
  eventLon?: number;
  language?: string;
  radiusKm?: number;
  title?: string;
  subtitle?: string;
  /** Hide the current restaurant from the list (e.g. on detail page). */
  excludeRestaurantId?: string;
  /** Match restaurant detail page panel styling. */
  variant?: "default" | "detail";
}

const INITIAL_COUNT = 6;

function LoadingSkeleton({ variant }: { variant: "default" | "detail" }) {
  return (
    <div className="nearby-restaurants-grid">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "overflow-hidden rounded-xl border border-[hsl(var(--restaurant-line))] bg-[hsl(var(--restaurant-panel))]",
            variant === "default" && "border-border bg-card",
          )}
        >
          <Skeleton className="aspect-[5/3] w-full rounded-none" />
          <div className="space-y-2 p-3.5">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

const NearbyRestaurants = ({
  eventLat,
  eventLon,
  language = "zh",
  radiusKm = 5,
  title,
  subtitle,
  excludeRestaurantId,
  variant = "default",
}: NearbyRestaurantsProps) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const displayTitle = title ?? t("restaurants.detail.nearbyTitle");
  const displaySubtitle =
    subtitle ??
    t("restaurants.detail.nearbySubtitleDefault", { radius: radiusKm });

  const { data: restaurantsWithDistance, isLoading, error } = useNearbyRestaurants(
    eventLat,
    eventLon,
    language,
    radiusKm,
  );

  const filteredRestaurants = useMemo(() => {
    if (!restaurantsWithDistance) return [];
    if (!excludeRestaurantId) return restaurantsWithDistance;
    return restaurantsWithDistance.filter(({ restaurant }) => restaurant.id !== excludeRestaurantId);
  }, [restaurantsWithDistance, excludeRestaurantId]);

  if (!eventLat || !eventLon) {
    return null;
  }

  const shellClass = cn(
    variant === "detail"
      ? "restaurant-panel overflow-hidden"
      : "rounded-xl border border-border bg-card shadow-sm",
  );

  const header = (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground md:text-lg">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UtensilsCrossed className="h-4 w-4" aria-hidden />
          </span>
          <span className="line-clamp-2">{displayTitle}</span>
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{displaySubtitle}</p>
      </div>
      {!isLoading && filteredRestaurants.length > 0 && (
        <span className="shrink-0 self-start rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground sm:self-auto">
          {t("restaurants.detail.nearbyCount", { count: filteredRestaurants.length })}
        </span>
      )}
    </header>
  );

  if (isLoading) {
    return (
      <section className={shellClass} aria-busy="true">
        <div className="space-y-5 p-4 md:p-6">
          {header}
          <LoadingSkeleton variant={variant} />
        </div>
      </section>
    );
  }

  if (error || filteredRestaurants.length === 0) {
    return (
      <section className={shellClass}>
        <div className="space-y-4 p-4 md:p-6">
          {header}
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <MapPin className="mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden />
            <p className="text-sm text-muted-foreground">{t("restaurants.detail.nearbyEmpty")}</p>
          </div>
        </div>
      </section>
    );
  }

  const displayedRestaurants = showAll
    ? filteredRestaurants
    : filteredRestaurants.slice(0, INITIAL_COUNT);
  const hasMore = filteredRestaurants.length > INITIAL_COUNT;

  return (
    <section className={shellClass} aria-label={displayTitle}>
      <div className="space-y-5 p-4 md:p-6">
        {header}

        <div className="nearby-restaurants-grid">
          {displayedRestaurants.map(({ restaurant, distance }) => (
            <NearbyRestaurantCard key={restaurant.id} restaurant={restaurant} distanceKm={distance} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll ? (
                <>
                  {t("restaurants.detail.nearbyShowLess")}
                  <ChevronUp className="h-4 w-4" aria-hidden />
                </>
              ) : (
                <>
                  {t("restaurants.detail.nearbyShowMore", {
                    count: filteredRestaurants.length - INITIAL_COUNT,
                  })}
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyRestaurants;
