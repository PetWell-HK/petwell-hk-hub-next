import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DirectAnswerBox from "@/components/DirectAnswerBox";
import FAQSection from "@/components/FAQSection";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
const appPreviewAbout = "/assets/app-preview-about.png";
import MediaLogoMarquee from "@/components/MediaLogoMarquee";
import HomePlatform from "@/components/HomePlatform";
import Testimonials from "@/components/Testimonials";
import ContactUsForm from "@/components/ContactUsForm";
import { useSEO } from "@/hooks/useSEO";
import { usePetwellFaq } from "@/hooks/usePetwellFaq";

const About = () => {
  const { t } = useTranslation();
  const faqItems = usePetwellFaq();

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: t("about.seo.structuredName"),
      description: t("about.seo.structuredDescription"),
      url: "https://petwellhk.com/about",
      mainEntity: {
        "@type": "Organization",
        name: "PetWell HK",
        url: "https://petwellhk.com",
        description: t("about.seo.orgDescription"),
      },
    }),
    [t],
  );

  useSEO({
    title: t("about.seo.title"),
    description: t("about.seo.description"),
    keywords: t("about.seo.keywords"),
    canonicalUrl: "https://petwellhk.com/about",
    structuredData,
    faqItems: faqItems,
    speakableSelectors: [".hero-summary", ".faq-answer", "h1"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero
          previewImage={appPreviewAbout}
          previewWidth={1024}
          previewHeight={576}
          previewLayout="landscape"
        />
        <MediaLogoMarquee />

        <section className="container mx-auto px-4 py-8 seo-hidden">
          <DirectAnswerBox
            question={t("about.directAnswer.question")}
            answer={t("about.directAnswer.answer")}
          />
        </section>

        <section className="border-b border-border py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="home-section-label">{t("about.mission.eyebrow")}</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                {t("about.mission.title")}
              </h2>
            </div>
            <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>{t("about.mission.paragraph1")}</p>
              <p>{t("about.mission.paragraph2")}</p>
            </div>
          </div>
        </section>

        <Features />
        <HomePlatform />
        <Testimonials />

        <div className="container mx-auto px-4 pb-8">
          <FAQSection items={faqItems} title={t("about.faqTitle")} />
        </div>

        <section className="border-t border-border bg-muted/25 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("about.contact.title")}</h2>
              <p className="mt-4 text-muted-foreground">{t("about.contact.description")}</p>

              <div className="mt-10 rounded-2xl border border-border bg-background p-6 md:p-8">
                <ContactUsForm sourceLabel="[About Contact Form]" className="space-y-6" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
