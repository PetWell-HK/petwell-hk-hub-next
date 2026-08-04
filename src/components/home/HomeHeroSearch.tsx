import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
const heroImage = "/assets/home-hero-pets-blanket.webp";

export type HomeSearchCategory =
  | "all"
  | "clinics"
  | "salons"
  | "lodging"
  | "restaurants"
  | "review"
  | "nutrition"
  | "activities"
  | "forum"
  | "ownerZone";

const CATEGORY_ROUTES: Record<HomeSearchCategory, string> = {
  all: "/clinics",
  clinics: "/clinics",
  salons: "/salons",
  lodging: "/lodging",
  restaurants: "/restaurants",
  review: "/review",
  nutrition: "/nutrition",
  activities: "/pet-activities",
  forum: "/forum",
  ownerZone: "/owner-zone",
};

const CATEGORY_CONFIG = [
  { id: "restaurants", labelKey: "nav.restaurants" },
  { id: "review", labelKey: "homePortal.tabs.review" },
  { id: "clinics", labelKey: "nav.clinics" },
  { id: "activities", labelKey: "nav.petActivities" },
  { id: "salons", labelKey: "nav.salons" },
  { id: "lodging", labelKey: "nav.lodging" },
  { id: "forum", labelKey: "nav.forum" },
] as const;

const CATEGORY_PLACEHOLDER_KEYS: Record<
  (typeof CATEGORY_CONFIG)[number]["id"],
  string
> = {
  restaurants: "restaurants.searchPlaceholder",
  review: "homePortal.search.placeholders.review",
  clinics: "clinics.searchPlaceholder",
  activities: "homePortal.search.placeholders.activities",
  salons: "salons.searchPlaceholder",
  lodging: "lodging.searchPlaceholder",
  forum: "forum.searchPlaceholder",
};

const HomeHeroSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState<HomeSearchCategory>("restaurants");
  const [query, setQuery] = useState("");

  const navigateWithSearch = (searchQuery: string, category: HomeSearchCategory = activeCategory) => {
    const trimmed = searchQuery.trim();
    const baseRoute = CATEGORY_ROUTES[category];
    const destination = trimmed
      ? `${baseRoute}?q=${encodeURIComponent(trimmed)}`
      : baseRoute;
    navigate(destination);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    navigateWithSearch(query);
  };

  const searchPlaceholder = t(CATEGORY_PLACEHOLDER_KEYS[activeCategory]);

  return (
    <section className="home-portal-hero">
      <div className="home-portal-hero__visual" aria-hidden="true">
        <div
          className="home-portal-hero__bg"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="home-portal-hero__overlay" />
      </div>

      <div className="home-portal-hero__content container mx-auto px-4">
        <header className="home-portal-hero__headline home-reveal">
          <p className="home-portal-hero__eyebrow">{t("homePortal.hero.eyebrow")}</p>
          <h1 className="home-portal-hero__title">{t("homePortal.hero.title")}</h1>
          <p className="home-portal-hero__subtitle">
            {t(isMobile ? "homePortal.hero.subtitleMobile" : "homePortal.hero.subtitle")}
          </p>
        </header>

        <div className="home-search-card home-reveal home-reveal-delay-1">
          <nav
            className="home-search-card__tabs"
            role="tablist"
            aria-label={t("homePortal.search.categoryLabel")}
          >
            {CATEGORY_CONFIG.map(({ id, labelKey }) => {
              const isActive = activeCategory === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(id)}
                  className={cn(
                    "home-search-card__tab",
                    isActive && "home-search-card__tab--active",
                  )}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </nav>

          <form onSubmit={handleSubmit} className="home-search-card__form">
            <div className="home-search-card__field">
              <Search className="home-search-card__icon" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="home-search-card__input"
                aria-label={searchPlaceholder}
              />
            </div>
            <button type="submit" className="home-search-card__submit">
              {t("homePortal.search.submit")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSearch;
