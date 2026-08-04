import { CheckCircle2, ShieldCheck, Smartphone, Sparkles, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import NametagTestimonialMarquee from "@/components/NametagTestimonialMarquee";

const BENEFIT_ICONS = [ShieldCheck, Smartphone, CheckCircle2] as const;
const BENEFIT_KEYS = ["one", "two", "three"] as const;

const NametagHero = () => {
  const { t } = useTranslation();

  return (
    <section className="nametag-hero" aria-labelledby="nametag-hero-heading">
      <div className="nametag-hero__glow" aria-hidden />
      <div className="nametag-hero__grain" aria-hidden />

      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="nametag-hero-grid">
          <div className="nametag-hero-copy min-w-0">
            <div className="nametag-hero__badge">
              <Tag className="h-4 w-4" aria-hidden />
              {t("nametagPage.hero.badge")}
            </div>

            <h1 id="nametag-hero-heading" className="nametag-hero__title">
              {t("nametagPage.hero.title")}
              <span className="nametag-hero__title-accent">{t("nametagPage.hero.titleHighlight")}</span>
            </h1>

            <div className="nametag-hero__tap nametag-hero-summary">
              <span className="nametag-hero__tap-icon" aria-hidden>
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="nametag-hero__tap-text">{t("nametagPage.hero.tapBadge")}</span>
            </div>

            <p className="nametag-hero__lead">{t("nametagPage.hero.line2")}</p>
            <p className="nametag-hero__body">{t("nametagPage.hero.summaryPrimary")}</p>
            <p className="nametag-hero__body nametag-hero__body--muted">{t("nametagPage.hero.summarySecondary")}</p>

            <div className="nametag-benefits nametag-hero__chips" role="list">
              {BENEFIT_KEYS.map((key, index) => {
                const Icon = BENEFIT_ICONS[index];
                return (
                  <div key={key} className="nametag-benefit-chip" role="listitem">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <div>
                      <p className="nametag-benefit-chip__title">{t(`nametagPage.benefits.${key}.title`)}</p>
                      <p className="nametag-benefit-chip__desc">{t(`nametagPage.benefits.${key}.desc`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="nametag-hero__callout">{t("nametagPage.hero.searchIntent")}</p>
          </div>

          <div className="nametag-hero-visual min-w-0">
            <div className="nametag-hero-visual__frame">
              <p className="nametag-hero-visual__label">{t("nametagPage.socialProof.eyebrow")}</p>
              <NametagTestimonialMarquee variant="hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NametagHero;
