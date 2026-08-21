import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CalendarDays,
  Home,
  Scissors,
  Stethoscope,
  TrendingDown,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HomeClinicCard,
  HomeEventCard,
  HomeProductCard,
  HomeRestaurantCard,
  HomeServiceCard,
} from "@/components/home/cards";
import type { EventListCardData } from "@/components/EventListCard";
import { useClinics } from "@/hooks/useClinics";
import {
  HOME_FEATURED_RESTAURANT_COUNT,
  useHomeFeaturedRestaurants,
} from "@/hooks/useRestaurants";
import { useSalons } from "@/hooks/useSalons";
import { useLodgings } from "@/hooks/useLodging";
import { usePriceReviewProducts } from "@/hooks/usePriceReviewProducts";
import {
  calculateEventStatus,
  extractDistrict,
  fetchAllEvents,
  type EventStatus,
  type OrganizedEvent,
} from "@/services/eventApi";
import { savingsPct } from "@/lib/priceReviewPricing";
import { pickFeaturedWithPremiumFirst } from "@/utils/partnerPremium";
import { translateServiceOfferings } from "@/utils/serviceOfferings";
import type { HomeRails } from "@/types/homeRails";
import HomeSuggestions from "@/components/home/HomeSuggestions";

const EVENT_CATEGORY_KEYS = [
  "ADOPTION",
  "MARKET",
  "EXPO",
  "WORKSHOP",
  "CHARITY",
  "MEETUP",
  "PET_FRIENDLY",
  "OTHER",
] as const;

type SectorId = "review" | "restaurants" | "events" | "clinics" | "salons" | "lodging";

function getEventCategoryLabel(
  t: (key: string) => string,
  category?: string | null,
) {
  const normalized = EVENT_CATEGORY_KEYS.includes(category as (typeof EVENT_CATEGORY_KEYS)[number])
    ? category
    : "OTHER";
  return t(`event.categories.${normalized}`);
}

function getEventStatusBadge(
  t: (key: string) => string,
  status: EventStatus,
) {
  switch (status) {
    case "startingSoon":
      return { label: t("event.status.startingSoon"), className: "home-card--event__status--soon" };
    case "upcoming":
      return { label: t("event.status.upcoming"), className: "home-card--event__status--upcoming" };
    case "ongoing":
      return { label: t("event.status.ongoing"), className: "home-card--event__status--live" };
    case "completed":
      return { label: t("event.status.completed"), className: "home-card--event__status--done" };
    default:
      return { label: t("event.status.cancelled"), className: "home-card--event__status--done" };
  }
}

function formatEventDate(dateTime: string, language: string) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-HK" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateTime));
}

function toEventListCardData(event: OrganizedEvent): EventListCardData | null {
  if (!event.name || !event.dateTime) return null;

  return {
    id: event.id,
    name: event.name,
    dateTime: event.dateTime,
    location: event.location,
    district: event.district || extractDistrict(event.location ?? "") || "",
    imageUrl: event.photos?.[0],
    category: event.category,
    price: event.price,
    status: calculateEventStatus(event),
  };
}

interface SectorRailProps {
  id: string;
  sector: SectorId;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  viewAllHref: string;
  viewAllLabel: string;
  loading?: boolean;
  skeletonCount?: number;
  children: ReactNode;
}

function SectorRail({
  id,
  sector,
  icon: Icon,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel,
  children,
  loading = false,
  skeletonCount = 4,
}: SectorRailProps) {
  return (
    <section
      className="home-sector-rail"
      data-sector={sector}
      aria-labelledby={`${id}-heading`}
    >
      <div className="container mx-auto px-4">
        <div className="home-sector-rail__header">
          <div className="home-sector-rail__title-wrap">
            <span className="home-sector-rail__icon-badge">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 id={`${id}-heading`} className="home-sector-rail__title">
                {title}
              </h2>
              {subtitle && <p className="home-sector-rail__subtitle">{subtitle}</p>}
            </div>
          </div>
          <Link to={viewAllHref} className="home-sector-rail__view-all">
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="home-sector-rail__clip">
        <div className="container mx-auto min-w-0 overflow-hidden px-4">
          {loading ? (
            <div className="home-sector-rail__scroll">
              {Array.from({ length: skeletonCount }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="home-sector-rail__item home-sector-rail__skeleton shrink-0 rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="home-sector-rail__scroll">{children}</div>
          )}
        </div>
      </div>
    </section>
  );
}

function RailItem({ children }: { children: ReactNode }) {
  return <div className="home-sector-rail__item">{children}</div>;
}

const HomeSectorShowcase = ({
  initialHome = null,
}: {
  initialHome?: HomeRails | null;
}) => {
  const { t, i18n } = useTranslation();
  const { data: reviewData, isLoading: reviewLoading } = usePriceReviewProducts(
    { limit: 12 },
    initialHome?.reviews,
  );
  const { data: featuredRestaurants = [], isLoading: restaurantsLoading } =
    useHomeFeaturedRestaurants(i18n.language, HOME_FEATURED_RESTAURANT_COUNT, initialHome?.restaurants);
  const { data: clinics = [], isLoading: clinicsLoading } = useClinics(
    i18n.language,
    initialHome?.clinics,
  );
  const { data: salons = [], isLoading: salonsLoading } = useSalons(
    i18n.language,
    initialHome?.salons,
  );
  const { data: lodgings = [], isLoading: lodgingsLoading } = useLodgings(
    i18n.language,
    initialHome?.lodgings,
  );
  const [events, setEvents] = useState<EventListCardData[]>(() =>
    (initialHome?.events ?? [])
      .map(toEventListCardData)
      .filter((event): event is EventListCardData => event !== null),
  );
  const [eventsLoading, setEventsLoading] = useState(!initialHome?.events?.length);

  useEffect(() => {
    let cancelled = false;

    const loadEvents = async () => {
      try {
        const result = await fetchAllEvents({ limit: 20 });
        if (cancelled) return;
        const upcoming = result.items
          .map(toEventListCardData)
          .filter((event): event is EventListCardData => event !== null)
          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
          .slice(0, 8);
        if (!cancelled) setEvents(upcoming);
      } catch {
        if (!cancelled && events.length === 0) setEvents([]);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    };

    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const reviewProducts = useMemo(() => {
    const items = reviewData?.items ?? [];
    return [...items].sort((a, b) => savingsPct(b) - savingsPct(a)).slice(0, 8);
  }, [reviewData?.items]);

  const featuredClinics = useMemo(() => {
    const eligible = clinics.filter((c) => c.hasData);
    if (eligible.length <= 8) return eligible;
    return pickFeaturedWithPremiumFirst(eligible, 8, (items) => [...items]);
  }, [clinics]);

  const featuredSalons = useMemo(() => {
    if (salons.length <= 8) return salons;
    return pickFeaturedWithPremiumFirst(salons, 8, (items) => [...items]);
  }, [salons]);
  const topLodgings = useMemo(() => {
    if (lodgings.length <= 8) return lodgings;
    return pickFeaturedWithPremiumFirst(lodgings, 8, (items) => [...items]);
  }, [lodgings]);

  const getDisplayServices = (services: string[]) =>
    translateServiceOfferings(services, i18n.language);

  return (
    <div className="home-sector-showcase">
      <SectorRail
        id="home-review"
        sector="review"
        icon={TrendingDown}
        title={t("homePortal.sectors.review.title")}
        subtitle={t("homePortal.sectors.review.subtitle")}
        viewAllHref="/review"
        viewAllLabel={t("homePortal.sectors.viewAll")}
        loading={reviewLoading}
      >
        {reviewProducts.map((product) => (
          <RailItem key={product.id}>
            <HomeProductCard product={product} />
          </RailItem>
        ))}
      </SectorRail>

      <HomeSuggestions />

      <SectorRail
        id="home-restaurants"
        sector="restaurants"
        icon={UtensilsCrossed}
        title={t("homePortal.sectors.restaurants.title")}
        subtitle={t("homePortal.sectors.restaurants.subtitle")}
        viewAllHref="/restaurants"
        viewAllLabel={t("homePortal.sectors.viewAll")}
        loading={restaurantsLoading}
      >
        {featuredRestaurants.map((restaurant) => (
          <RailItem key={restaurant.id}>
            <HomeRestaurantCard restaurant={restaurant} />
          </RailItem>
        ))}
      </SectorRail>

      <SectorRail
        id="home-events"
        sector="events"
        icon={CalendarDays}
        title={t("homePortal.sectors.events.title")}
        subtitle={t("homePortal.sectors.events.subtitle")}
        viewAllHref="/pet-activities"
        viewAllLabel={t("homePortal.sectors.viewAll")}
        loading={eventsLoading}
      >
        {events.map((event) => {
          const statusBadge = getEventStatusBadge(t, event.status);
          return (
            <RailItem key={event.id}>
              <HomeEventCard
                event={event}
                statusLabel={statusBadge.label}
                statusClassName={statusBadge.className}
                categoryLabel={event.category ? getEventCategoryLabel(t, event.category) : undefined}
                formattedDate={formatEventDate(event.dateTime, i18n.language)}
                language={i18n.language}
              />
            </RailItem>
          );
        })}
      </SectorRail>

      <SectorRail
        id="home-clinics"
        sector="clinics"
        icon={Stethoscope}
        title={t("homePortal.sectors.clinics.title")}
        subtitle={t("homePortal.sectors.clinics.subtitle")}
        viewAllHref="/clinics"
        viewAllLabel={t("homePortal.sectors.viewAll")}
        loading={clinicsLoading}
      >
        {featuredClinics.map((clinic) => (
          <RailItem key={clinic.id}>
            <HomeClinicCard
              name={clinic.name}
              district={clinic.district}
              rating={clinic.rating}
              image={clinic.image}
              verified={clinic.verified}
              detailPath={`/clinics/${clinic.id}`}
              serviceLabels={getDisplayServices(clinic.services)}
              is247={clinic.is247}
              is247Label={t("clinics.filter24Hour")}
            />
          </RailItem>
        ))}
      </SectorRail>

      <SectorRail
        id="home-salons"
        sector="salons"
        icon={Scissors}
        title={t("homePortal.sectors.salons.title")}
        viewAllHref="/salons"
        viewAllLabel={t("homePortal.sectors.viewAll")}
        loading={salonsLoading}
      >
        {featuredSalons.map((salon) => (
          <RailItem key={salon.id}>
            <HomeServiceCard
              variant="salon"
              name={salon.name}
              district={salon.district}
              rating={salon.rating}
              image={salon.image}
              verified={salon.verified}
              detailPath={`/salons/${salon.id}`}
              serviceLabels={getDisplayServices(salon.services)}
              is247={salon.is247}
              is247Label={t("salons.filter24Hour")}
            />
          </RailItem>
        ))}
      </SectorRail>

      <SectorRail
        id="home-lodging"
        sector="lodging"
        icon={Home}
        title={t("homePortal.sectors.lodging.title")}
        viewAllHref="/lodging"
        viewAllLabel={t("homePortal.sectors.viewAll")}
        loading={lodgingsLoading}
      >
        {topLodgings.map((lodging) => (
          <RailItem key={lodging.id}>
            <HomeServiceCard
              variant="lodging"
              name={lodging.name}
              district={lodging.district}
              rating={lodging.rating}
              image={lodging.image}
              verified={lodging.verified}
              detailPath={`/lodging/${lodging.id}`}
              serviceLabels={getDisplayServices(lodging.services)}
              is247={lodging.is247}
              is247Label={t("lodging.filter24Hour")}
            />
          </RailItem>
        ))}
      </SectorRail>
    </div>
  );
};

export default HomeSectorShowcase;
