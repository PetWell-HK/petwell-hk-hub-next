import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import OsCtaButton from "@/components/other-services/OsCtaButton";
import OsHeroShowcase from "@/components/other-services/OsHeroShowcase";
import { eventsSiteUrl } from "@/lib/sites";

const TRUST_BADGE_KEYS = ["media", "appStore", "platform"] as const;

const OsHero = () => {
  const { t, i18n } = useTranslation();

  return (
    <section className="os-hero relative overflow-hidden">
      <div className="os-hero__glow" aria-hidden />
      <div className="container relative mx-auto px-6 py-10 md:px-10 md:py-12 lg:px-12 lg:py-14">
        <div className="os-hero__grid">
          <div className="os-hero__copy">
            <p className="os-eyebrow">{t("otherServices.hero.badge")}</p>
            <h1 className="os-section-heading mt-2">{t("otherServices.hero.title")}</h1>
            <p className="os-section-lead mt-3">{t("otherServices.hero.subtitle")}</p>

            <p className="os-section-meta mt-4">
              {TRUST_BADGE_KEYS.map((key, index) => (
                <span key={key}>
                  {index > 0 ? <span className="os-section-meta-sep" aria-hidden> · </span> : null}
                  {t(`otherServices.hero.trust.${key}`)}
                </span>
              ))}
            </p>

            <div className="os-hero__cta mt-5">
              <OsCtaButton className="os-cta-btn--compact" />
              <a
                href={eventsSiteUrl(i18n.language)}
                className="os-cta-btn os-cta-btn--secondary os-cta-btn--compact inline-flex items-center justify-center gap-2"
              >
                {t("otherServices.hero.eventsCta")}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>

          <div className="os-hero__visual">
            <OsHeroShowcase />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OsHero;
