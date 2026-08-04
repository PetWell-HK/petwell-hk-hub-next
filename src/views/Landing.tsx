import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DirectAnswerBox from "@/components/DirectAnswerBox";
import FAQSection from "@/components/FAQSection";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomePlatform from "@/components/HomePlatform";
import Testimonials from "@/components/Testimonials";
import { usePetwellFaq } from "@/hooks/usePetwellFaq";
import { useSEO } from "@/hooks/useSEO";

const Landing = () => {
  const { t } = useTranslation();
  const faqItems = usePetwellFaq();

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: t("landing.seo.structuredName"),
      url: "https://petwellhk.com",
      description: t("landing.seo.structuredDescription"),
      inLanguage: "zh-HK",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://petwellhk.com/clinics?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
      publisher: {
        "@type": "Organization",
        name: "PetWell HK Limited",
        url: "https://petwellhk.com",
        logo: {
          "@type": "ImageObject",
          url: "https://petwellhk.com/logo.png",
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "HK",
          addressRegion: "Hong Kong",
        },
      },
    }),
    [t],
  );

  useSEO({
    title: t("landing.seo.title"),
    description: t("landing.seo.description"),
    keywords: t("landing.seo.keywords"),
    canonicalUrl: "https://petwellhk.com/landing",
    structuredData,
    faqItems,
    speakableSelectors: [".hero-summary", ".faq-answer", "h1"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />

        <section className="container mx-auto px-4 py-8 seo-hidden">
          <DirectAnswerBox
            question={t("about.directAnswer.question")}
            answer={t("about.directAnswer.answer")}
          />
        </section>

        <Features />
        <HomePlatform />
        <Testimonials />

        <div className="container mx-auto px-4 pb-8">
          <FAQSection items={faqItems} title={t("about.faqTitle")} hidden={true} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
