import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Restaurant } from "@/services/restaurantApi";
import {
  HONG_KONG_18_DISTRICTS,
  HONG_KONG_REGION_HUBS,
  type Hk18District,
  type HkRegionKey,
  matchRestaurantToDistrict,
} from "@/data/hongKong18Districts";

interface RestaurantDistrictLinksProps {
  restaurants?: Restaurant[];
  currentSlug?: string;
  compact?: boolean;
  showCounts?: boolean;
}

const REGION_ORDER: HkRegionKey[] = ["香港", "九龍", "新界", "離島"];

function countForDistrict(restaurants: Restaurant[], district: Hk18District) {
  return restaurants.filter((r) => matchRestaurantToDistrict(r.district, district)).length;
}

export function RestaurantDistrictLinks({
  restaurants = [],
  currentSlug,
  compact = false,
  showCounts = true,
}: RestaurantDistrictLinksProps) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  return (
    <nav
      className="restaurant-district-links mt-10 border-t border-border pt-8"
      aria-label={t("restaurants.districtPage.districtNavTitle")}
    >
      <h2 className="text-lg font-semibold text-foreground md:text-xl">
        {t("restaurants.districtPage.districtNavTitle")}
      </h2>
      {!compact && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("restaurants.districtPage.districtNavDescription")}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/pet-friendly-restaurants/districts"
          className="rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
        >
          {t("restaurants.districtPage.allDistricts")}
        </Link>
        {HONG_KONG_REGION_HUBS.map((hub) => (
          <Link
            key={hub.slug}
            to={`/pet-friendly-restaurants/${hub.slug}`}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary"
          >
            {isEn ? hub.labelEn : hub.labelZh}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {REGION_ORDER.map((regionKey) => {
          const districts = HONG_KONG_18_DISTRICTS.filter((d) => d.regionKey === regionKey);
          if (districts.length === 0) return null;
          const regionLabel = isEn
            ? districts[0].regionLabelEn
            : districts[0].regionLabelZh;

          return (
            <div key={regionKey}>
              <h3 className="text-sm font-semibold text-foreground">{regionLabel}</h3>
              <ul className="mt-2 space-y-1.5">
                {districts.map((district) => {
                  const count = countForDistrict(restaurants, district);
                  const isCurrent = district.slug === currentSlug;
                  return (
                    <li key={district.slug}>
                      <Link
                        to={`/pet-friendly-restaurants/${district.slug}`}
                        className={`text-sm leading-snug hover:text-primary ${
                          isCurrent ? "font-semibold text-primary" : "text-muted-foreground"
                        }`}
                        aria-current={isCurrent ? "page" : undefined}
                      >
                        {isEn ? district.labelEn : district.labelZh}
                        {showCounts && count > 0 ? ` (${count})` : ""}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default RestaurantDistrictLinks;
