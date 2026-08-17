import { BedDouble, House, Scissors, ShoppingBag, Stethoscope, UtensilsCrossed } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

const discoverPlaces = [
  {
    key: "restaurants",
    href: "/restaurants",
    labelKey: "nav.restaurants",
    icon: UtensilsCrossed,
  },
  {
    key: "clinics",
    href: "/clinics",
    labelKey: "nav.clinics",
    icon: Stethoscope,
  },
  {
    key: "homeVisits",
    href: "/home-visits",
    labelKey: "nav.homeVisits",
    icon: House,
  },
  {
    key: "salons",
    href: "/salons",
    labelKey: "nav.salons",
    icon: Scissors,
  },
  {
    key: "lodging",
    href: "/lodging",
    labelKey: "nav.lodging",
    icon: BedDouble,
  },
  {
    key: "malls",
    href: "/malls",
    labelKey: "nav.malls",
    icon: ShoppingBag,
  },
] as const;

interface DiscoverPlaceTabsProps {
  className?: string;
  compact?: boolean;
}

const DiscoverPlaceTabs = ({ className, compact = false }: DiscoverPlaceTabsProps) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <nav aria-label="Discover place types" className={cn("discover-place-tabs", className)}>
      <div className="flex gap-0.5 overflow-x-auto scrollbar-none -mx-1 px-1">
        {discoverPlaces.map((place) => {
          const Icon = place.icon;
          const isActive =
            pathname === place.href || pathname.startsWith(`${place.href}/`);

          return (
            <Link
              key={place.key}
              to={place.href}
              data-active={isActive}
              className="discover-place-tab shrink-0"
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("opacity-70", compact ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden="true" />
              <span>{t(place.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default DiscoverPlaceTabs;
