import { useCallback, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AUDIENCE_CARD_IMAGES,
  AUDIENCE_SEGMENTS,
  type AudienceId,
  type ServiceChannelId,
} from "@/data/otherServicesConfig";
import { isBadgeMetric } from "@/lib/parseMetricValue";
import OsKpiBadge from "@/components/other-services/OsKpiBadge";
import { ScrollReveal } from "@/components/other-services/ScrollReveal";
import { cn } from "@/lib/utils";

const KPI_KEYS = ["a", "b", "c"] as const;

function openContactWidget() {
  window.dispatchEvent(new Event("petwell:open-contact"));
}

function ServiceAccordionItem({
  serviceId,
  variant,
}: {
  serviceId: ServiceChannelId;
  variant: "enterprise" | "merchant";
}) {
  const { t } = useTranslation();

  return (
    <AccordionItem value={serviceId} className="os-services-accordion__item">
      <AccordionTrigger className="os-services-accordion__trigger">
        <span className="os-services-accordion__trigger-text">
          <span className="os-services-accordion__title">{t(`otherServices.channels.${serviceId}.title`)}</span>
          <span className="os-services-accordion__teaser">{t(`otherServices.channels.${serviceId}.summary`)}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="os-services-accordion__content">
        <p className="os-services-accordion__desc">{t(`otherServices.channels.${serviceId}.summary`)}</p>
        <div className="os-services-accordion__kpis">
          {KPI_KEYS.map((key) => {
            const value = t(`otherServices.channels.${serviceId}.kpis.${key}.value`);
            const label = t(`otherServices.channels.${serviceId}.kpis.${key}.label`);

            if (isBadgeMetric(value)) {
              return (
                <OsKpiBadge key={key} variant={variant} title={label}>
                  {value}
                </OsKpiBadge>
              );
            }

            return (
              <div key={key} className="os-services-accordion__kpi">
                <span className="os-services-accordion__kpi-value">{value}</span>
                <span className="os-services-accordion__kpi-label">{label}</span>
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function AudienceSectionCta() {
  const { t } = useTranslation();

  return (
    <div className="os-services-accordion-cta">
      <button type="button" className="os-cta-btn os-cta-btn--compact" onClick={openContactWidget}>
        {t("otherServices.audiences.enterprise.cta")}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function AudienceCategoryCard({
  audienceId,
  isSelected,
  onSelect,
}: {
  audienceId: AudienceId;
  isSelected: boolean;
  onSelect: (id: AudienceId) => void;
}) {
  const { t } = useTranslation();
  const isEnterprise = audienceId === "enterprise";

  return (
    <button
      type="button"
      className={cn(
        "os-audience-card",
        isEnterprise ? "os-audience-card--enterprise" : "os-audience-card--merchant",
        isSelected && "os-audience-card--selected",
      )}
      onClick={() => onSelect(audienceId)}
      aria-pressed={isSelected}
      aria-expanded={isSelected}
    >
      <div className="os-audience-card__media">
        <img
          src={AUDIENCE_CARD_IMAGES[audienceId].src}
          alt={t(`otherServices.audiences.${audienceId}.imageAlt`)}
          loading="lazy"
          decoding="async"
          style={
            {
              "--os-audience-pos": AUDIENCE_CARD_IMAGES[audienceId].objectPosition,
              ...(AUDIENCE_CARD_IMAGES[audienceId].objectPositionDesktop
                ? { "--os-audience-pos-md": AUDIENCE_CARD_IMAGES[audienceId].objectPositionDesktop }
                : {}),
            } as CSSProperties
          }
        />
      </div>
      <div className="os-audience-card__body">
        <p className="os-eyebrow">{t(`otherServices.audiences.${audienceId}.eyebrow`)}</p>
        <h3 className="os-audience-card__title">{t(`otherServices.audiences.${audienceId}.title`)}</h3>
        <p className="os-audience-card__tagline">{t(`otherServices.audiences.${audienceId}.cardTagline`)}</p>
        <span className="os-audience-card__cta">
          {t("otherServices.audiences.viewMore")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </button>
  );
}

const AudienceServices = () => {
  const { t } = useTranslation();
  const [selectedAudience, setSelectedAudience] = useState<AudienceId | null>(null);
  const accordionRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((audienceId: AudienceId) => {
    setSelectedAudience(audienceId);
    window.requestAnimationFrame(() => {
      accordionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const activeSegment = AUDIENCE_SEGMENTS.find((segment) => segment.id === selectedAudience);

  return (
    <section className="os-section os-section--services" aria-labelledby="os-services-heading">
      <div className="container mx-auto px-6 md:px-10 lg:px-12">
        <ScrollReveal className="os-section-header mx-auto max-w-2xl text-center">
          <h2 id="os-services-heading" className="os-section-heading">
            {t("otherServices.audiences.intro.title")}
          </h2>
          <p className="os-section-lead mx-auto mt-3">{t("otherServices.audiences.intro.subtitle")}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.06} className="os-audience-cards mx-auto mt-10 max-w-4xl md:mt-12">
          {AUDIENCE_SEGMENTS.map((segment) => (
            <AudienceCategoryCard
              key={segment.id}
              audienceId={segment.id}
              isSelected={selectedAudience === segment.id}
              onSelect={handleSelect}
            />
          ))}
        </ScrollReveal>

        {activeSegment ? (
          <div
            ref={accordionRef}
            className="os-services-accordion-wrap mx-auto mt-10 max-w-3xl scroll-mt-[calc(var(--header-height)+1.5rem)] md:mt-12"
          >
            <p className="os-eyebrow os-eyebrow--center">
              {t(`otherServices.audiences.${activeSegment.id}.eyebrow`)}
            </p>
            <Accordion type="single" collapsible className="os-services-accordion mt-4">
              {activeSegment.services.map((serviceId) => (
                <ServiceAccordionItem
                  key={serviceId}
                  serviceId={serviceId}
                  variant={activeSegment.id === "enterprise" ? "enterprise" : "merchant"}
                />
              ))}
            </Accordion>
            <AudienceSectionCta />
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default AudienceServices;
