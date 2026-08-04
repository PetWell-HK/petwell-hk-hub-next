import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MediaLogoMarquee from "@/components/MediaLogoMarquee";
import AudienceServices from "@/components/other-services/AudienceServices";
import CaseStudyGallery from "@/components/other-services/CaseStudyGallery";
import StatsSection from "@/components/other-services/StatsSection";
import OsHero from "@/components/other-services/OsHero";
import { ScrollReveal } from "@/components/other-services/ScrollReveal";
import { useSEO } from "@/hooks/useSEO";

const OtherServices = () => {
  const { t } = useTranslation();

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t("otherServices.seo.structuredName"),
      description: t("otherServices.seo.description"),
      url: "https://petwellhk.com/other-services",
      provider: {
        "@type": "Organization",
        name: "PetWell HK",
        url: "https://petwellhk.com",
      },
    }),
    [t],
  );

  useSEO({
    title: t("otherServices.seo.title"),
    description: t("otherServices.seo.description"),
    keywords: t("otherServices.seo.keywords"),
    canonicalUrl: "https://petwellhk.com/other-services",
    structuredData,
  });

  return (
    <div className="os-page min-h-screen">
      <Header />

      <main>
        <OsHero />

        <StatsSection />
        <CaseStudyGallery />

        <section className="os-section os-section--media">
          <ScrollReveal className="container mx-auto px-4">
            <p className="os-eyebrow os-eyebrow--center">{t("otherServices.trust.eyebrow")}</p>
            <p className="os-section-desc mx-auto mt-3 max-w-xl text-center">{t("otherServices.trust.subtitle")}</p>
          </ScrollReveal>
          <div className="mt-8">
            <MediaLogoMarquee variant="grayscaleHover" embedded featured />
          </div>
        </section>

        <AudienceServices />
      </main>

      <Footer />
    </div>
  );
};

export default OtherServices;
