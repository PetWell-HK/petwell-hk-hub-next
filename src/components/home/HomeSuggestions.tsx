import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
const reviewImage = "/assets/suggestions/review.png";
const restaurantsImage = "/assets/suggestions/restaurants.webp";
const activitiesImage = "/assets/suggestions/activities.webp";
const ownerZoneImage = "/assets/suggestions/owner-zone.webp";
const clinicsImage = "/assets/suggestions/clinics.webp";

interface FeaturedCard {
  id: string;
  titleKey: string;
  subtitleKey: string;
  href: string;
  image: string;
  imagePosition: string;
  size: "large" | "medium";
}

const FEATURED: FeaturedCard[] = [
  {
    id: "review",
    titleKey: "homePortal.featured.review.title",
    subtitleKey: "homePortal.featured.review.subtitle",
    href: "/review",
    image: reviewImage,
    imagePosition: "center center",
    size: "large",
  },
  {
    id: "restaurants",
    titleKey: "nav.restaurants",
    subtitleKey: "homePortal.suggestions.restaurantsSub",
    href: "/restaurants",
    image: restaurantsImage,
    imagePosition: "center 45%",
    size: "medium",
  },
  {
    id: "activities",
    titleKey: "homePortal.suggestions.activities",
    subtitleKey: "homePortal.suggestions.activitiesSub",
    href: "/pet-activities",
    image: activitiesImage,
    imagePosition: "center center",
    size: "medium",
  },
  {
    id: "ownerZone",
    titleKey: "nav.blog",
    subtitleKey: "homePortal.suggestions.ownerZoneSub",
    href: "/owner-zone",
    image: ownerZoneImage,
    imagePosition: "center center",
    size: "medium",
  },
  {
    id: "clinics",
    titleKey: "homePortal.sectors.clinics.title",
    subtitleKey: "homePortal.sectors.clinics.subtitle",
    href: "/clinics",
    image: clinicsImage,
    imagePosition: "center center",
    size: "medium",
  },
  {
    id: "homeVisits",
    titleKey: "homePortal.sectors.homeVisits.title",
    subtitleKey: "homePortal.sectors.homeVisits.subtitle",
    href: "/home-visits",
    image: clinicsImage,
    imagePosition: "center 30%",
    size: "medium",
  },
];

const HomeSuggestions = () => {
  const { t } = useTranslation();

  return (
    <section className="home-featured" aria-labelledby="home-featured-heading">
      <div className="container mx-auto px-4">
        <div className="home-featured__header">
          <h2 id="home-featured-heading" className="home-featured__title">
            {t("homePortal.featured.title")}
          </h2>
          <p className="home-featured__subtitle">{t("homePortal.featured.subtitle")}</p>
        </div>

        <div className="home-featured__grid">
          {FEATURED.map((item, index) => (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "home-featured-card home-reveal group",
                item.size === "large" && "home-featured-card--large",
                `home-reveal-delay-${Math.min(index + 1, 4)}`,
              )}
            >
              <div
                className="home-featured-card__bg"
                style={{
                  backgroundImage: `url(${item.image})`,
                  backgroundPosition: item.imagePosition,
                }}
                aria-hidden="true"
              />
              <div className="home-featured-card__glass">
                <div className="home-featured-card__content">
                  <h3 className="home-featured-card__title">{t(item.titleKey)}</h3>
                  <p className="home-featured-card__desc">{t(item.subtitleKey)}</p>
                  <span className="home-featured-card__cta">
                    {t("homePortal.suggestions.explore")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Link
            to="/pet-friendly-restaurants/districts"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 font-medium text-primary hover:bg-primary/10"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {t("homePortal.suggestions.districtsLink")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeSuggestions;
