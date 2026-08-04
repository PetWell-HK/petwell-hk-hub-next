import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Car, ChevronDown, Globe, Navigation, Phone } from "lucide-react";
import type { Mall } from "@/services/mallApi";
import { NearbyRestaurantsDropdown } from "@/components/mall/NearbyRestaurantsDropdown";

interface MallVisitActionsProps {
  mall: Mall;
  mapsUrl: string | null;
  lang: "zh" | "en";
}

export function MallVisitActions({ mall, mapsUrl, lang }: MallVisitActionsProps) {
  const { t } = useTranslation();
  const parking = mall.parking;
  const hasParkingInfo =
    !!mall.parkingWebsite ||
    !!parking?.hasOwnCarPark ||
    parking?.weekdayRateHkd != null ||
    parking?.weekendRateHkd != null ||
    (parking?.spendToParkOffers.length ?? 0) > 0 ||
    !!parking?.tips;

  const formatRate = (hkd: number | null | undefined) => {
    if (hkd == null) return null;
    if (parking?.rateUnit === "PER_HOUR") {
      return t("mallPlaces.detail.ratePerHour", { amount: hkd });
    }
    return t("mallPlaces.detail.rateAmount", { amount: hkd });
  };

  const weekdayRate = formatRate(parking?.weekdayRateHkd);
  const weekendRate = formatRate(parking?.weekendRateHkd);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {mall.phone && (
        <a
          href={`tel:${mall.phone}`}
          className="restaurant-action-btn restaurant-action-btn--primary"
        >
          <Phone className="h-4 w-4" />
          {t("mallPlaces.detail.callNow")}
        </a>
      )}

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="restaurant-action-btn restaurant-action-btn--primary"
        >
          <Navigation className="h-4 w-4" />
          {t("mallPlaces.detail.getDirections")}
        </a>
      )}

      {mall.website && (
        <a
          href={mall.website}
          target="_blank"
          rel="noreferrer"
          className="restaurant-action-btn"
        >
          <Globe className="h-4 w-4" />
          {t("mallPlaces.detail.visitWebsite")}
        </a>
      )}

      {hasParkingInfo ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="restaurant-action-btn w-full">
              <Car className="h-4 w-4" />
              {t("mallPlaces.detail.parking")}
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel>{t("mallPlaces.detail.parkingDetails")}</DropdownMenuLabel>
            {weekdayRate && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {t("mallPlaces.detail.weekdayRate")}: {weekdayRate}
              </div>
            )}
            {weekendRate && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {t("mallPlaces.detail.weekendRate")}: {weekendRate}
              </div>
            )}
            {parking?.heightLimitM != null && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {t("mallPlaces.detail.heightLimitValue", {
                  meters: parking.heightLimitM,
                })}
              </div>
            )}
            {parking?.spendToParkOffers.map((offer, idx) =>
              offer.notes ? (
                <div
                  key={`spend-${idx}`}
                  className="px-2 py-1.5 text-sm leading-snug text-foreground"
                >
                  {offer.notes}
                </div>
              ) : null,
            )}
            {parking?.tips && (
              <div className="px-2 py-1.5 text-sm leading-snug text-foreground">
                {parking.tips}
              </div>
            )}
            {mall.parkingWebsite && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href={mall.parkingWebsite} target="_blank" rel="noreferrer">
                    {t("mallPlaces.detail.parkingWebsite")}
                  </a>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <NearbyRestaurantsDropdown
        lat={mall.location?.lat}
        lon={mall.location?.lon}
        mallName={mall.name}
        language={lang}
      />
    </div>
  );
}
