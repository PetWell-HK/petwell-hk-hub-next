import {
  MapPin,
  Phone,
  Star,
  Globe,
  Clock,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RestaurantVerificationBadge } from "@/components/RestaurantVerificationBadge";
import { PremiumPartnerBadge } from "@/components/PremiumPartnerBadge";
import { RestaurantRatingPills } from "@/components/restaurant/RestaurantRatingPills";
import WritePlaceReviewCTA from "@/components/WritePlaceReviewCTA";
import type { RestaurantExternalMetadata } from "@/types/restaurantExternalMetadata";
import type { MultiLangString } from "@/services/restaurantApi";

interface RestaurantDetailIdentityProps {
  name: string;
  district: string;
  todayHours: string | null;
  is247?: boolean;
  verified?: boolean;
  isPremium?: boolean;
  fehdLicensed?: boolean;
  listingAlert?: MultiLangString | string | null;
  totalRating?: number;
  totalReviews: number;
  importMetadata: RestaurantExternalMetadata | null;
  phoneNo?: string | null;
  website?: string | null;
  mapsUrl: string;
  callLabel: string;
  directionsLabel: string;
  websiteLabel: string;
  open247Label: string;
  reviewsLabel: string;
  layout?: "mobile" | "desktop";
  placeId: string;
  placeName: string;
}

export function RestaurantDetailIdentity({
  name,
  district,
  todayHours,
  is247,
  verified,
  isPremium,
  fehdLicensed,
  listingAlert,
  totalRating,
  totalReviews,
  importMetadata,
  phoneNo,
  website,
  mapsUrl,
  callLabel,
  directionsLabel,
  websiteLabel,
  open247Label,
  reviewsLabel,
  layout = "mobile",
  placeId,
  placeName,
}: RestaurantDetailIdentityProps) {
  const isDesktop = layout === "desktop";

  return (
    <div className={`flex flex-col ${isDesktop ? "gap-5" : ""}`}>
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {isPremium && <PremiumPartnerBadge />}
          <RestaurantVerificationBadge
            verified={verified}
            fehdLicensed={fehdLicensed}
            listingAlert={listingAlert}
            externalMetadata={importMetadata}
          />
          {is247 && (
            <Badge variant="secondary" className="font-medium">
              <Clock className="mr-1 h-3 w-3" />
              {open247Label}
            </Badge>
          )}
        </div>

        <h1
          className={`font-bold leading-snug ${
            isDesktop ? "text-2xl xl:text-[2rem] xl:leading-tight" : "text-xl md:text-2xl"
          }`}
        >
          {name}
        </h1>

        <div
          className={`mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted-foreground ${
            isDesktop ? "text-base" : "text-sm"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {district}
          </span>
          {(todayHours || is247) && (
            <>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" aria-hidden />
                {todayHours || open247Label}
              </span>
            </>
          )}
        </div>

        <div className={`mt-4 flex flex-wrap items-center gap-3 ${isDesktop ? "gap-4" : ""}`}>
          {totalRating && totalRating > 0 && (
            <div className="flex items-center gap-2.5">
              <span
                className={`restaurant-score font-bold leading-none text-primary ${
                  isDesktop ? "text-4xl" : "text-3xl"
                }`}
              >
                {totalRating.toFixed(1)}
              </span>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(totalRating) ? "fill-primary text-primary" : "text-muted"
                      }`}
                      aria-hidden
                    />
                  ))}
                </div>
                {totalReviews > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {totalReviews} {reviewsLabel}
                  </p>
                )}
              </div>
            </div>
          )}
          <RestaurantRatingPills metadata={importMetadata} />
        </div>
      </div>

      {/* Actions: desktop header + tablet only; mobile uses sticky bar */}
      <div
        className={
          isDesktop
            ? "grid grid-cols-2 gap-2"
            : "mt-5 hidden gap-2 md:grid md:grid-cols-2 lg:hidden"
        }
      >
        {phoneNo && (
          <a href={`tel:${phoneNo}`} className="restaurant-action-btn restaurant-action-btn--primary">
            <Phone className="h-4 w-4" />
            {callLabel}
          </a>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="restaurant-action-btn"
        >
          <Navigation className="h-4 w-4 text-primary" />
          {directionsLabel}
        </a>
        <WritePlaceReviewCTA
          placeType="restaurant"
          placeId={placeId}
          placeName={placeName}
          buttonVariant="outline"
          className="restaurant-action-btn"
        />
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="restaurant-action-btn"
          >
            <Globe className="h-4 w-4 text-primary" />
            {websiteLabel}
          </a>
        )}
      </div>
    </div>
  );
}
