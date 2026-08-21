import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import { ArrowRight, CalendarDays, Crown, Sparkles, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PromoBanner {
  id: string;
  titleKey: string;
  subtitleKey: string;
  ctaKey: string;
  href: string;
  icon: LucideIcon;
  tone: string;
}

const PROMO_BANNERS: PromoBanner[] = [
  {
    id: "review",
    titleKey: "homePortal.promos.review.title",
    subtitleKey: "homePortal.promos.review.subtitle",
    ctaKey: "homePortal.promos.cta",
    href: "/review",
    icon: TrendingDown,
    tone: "review",
  },
  {
    id: "member",
    titleKey: "homePortal.promos.member.title",
    subtitleKey: "homePortal.promos.member.subtitle",
    ctaKey: "homePortal.promos.cta",
    href: "/petwell-member",
    icon: Crown,
    tone: "member",
  },
  {
    id: "activities",
    titleKey: "homePortal.promos.activities.title",
    subtitleKey: "homePortal.promos.activities.subtitle",
    ctaKey: "homePortal.promos.cta",
    href: "/pet-activities",
    icon: CalendarDays,
    tone: "activities",
  },
];

const HomePromoCarousel = () => {
  const { t } = useTranslation();

  return (
    <section className="home-promo-strip" aria-labelledby="home-promos-heading">
      <div className="container mx-auto px-4">
        <div className="home-promo-strip__head">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="home-promos-heading" className="home-promo-strip__title">
              {t("homePortal.promos.title")}
            </h2>
          </div>
        </div>

        <div className="home-promo-strip__grid">
          {PROMO_BANNERS.map((banner) => {
            const Icon = banner.icon;
            return (
              <AppLink
                key={banner.id}
                href={banner.href}
                className={`home-promo-banner home-promo-banner--${banner.tone}`}
              >
                <div className="home-promo-banner__glow" aria-hidden="true" />
                <div className="home-promo-banner__content">
                  <span className="home-promo-banner__icon-wrap">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="home-promo-banner__title">{t(banner.titleKey)}</h3>
                    <p className="home-promo-banner__subtitle">{t(banner.subtitleKey)}</p>
                  </div>
                  <span className="home-promo-banner__cta">
                    {t(banner.ctaKey)}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </AppLink>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomePromoCarousel;
