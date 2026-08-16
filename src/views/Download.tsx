"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Gift, Heart, Search, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MediaLogoMarquee from "@/components/MediaLogoMarquee";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/components/AppDownloadCTA";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

const appPreviewAbout = "/assets/app-preview-about.png";
const appStoreBadge = "/assets/app-store-badge-new.png";
const googlePlayBadge = "/assets/google-play-badge-new.png";
const downloadQr = "/assets/download-qr.svg";

const NAMETAG_FORM_URL = "https://forms.gle/SAZgMtHqKKKw4jDR8";

type StorePlatform = "ios" | "android" | "desktop";

function detectStorePlatform(): StorePlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || navigator.vendor || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function storeUrlFor(platform: StorePlatform): string {
  switch (platform) {
    case "ios":
      return APP_STORE_URL;
    case "android":
      return PLAY_STORE_URL;
    case "desktop":
      return APP_STORE_URL;
    default: {
      const _never: never = platform;
      return _never;
    }
  }
}

function primaryLabelKey(platform: StorePlatform): "download.primaryIos" | "download.primaryAndroid" | "download.openStore" {
  switch (platform) {
    case "ios":
      return "download.primaryIos";
    case "android":
      return "download.primaryAndroid";
    case "desktop":
      return "download.openStore";
    default: {
      const _never: never = platform;
      return _never;
    }
  }
}

const Download = () => {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<StorePlatform>("desktop");

  useEffect(() => {
    setPlatform(detectStorePlatform());
  }, []);

  const isMobileStore = platform === "ios" || platform === "android";
  const primaryStoreUrl = storeUrlFor(platform);

  const faqItems = useMemo(
    () => [
      {
        question: t("download.faq.platforms.question"),
        answer: t("download.faq.platforms.answer"),
      },
      {
        question: t("download.faq.needApp.question"),
        answer: t("download.faq.needApp.answer"),
      },
      {
        question: t("download.faq.desktop.question"),
        answer: t("download.faq.desktop.answer"),
      },
    ],
    [t],
  );

  const reasons = useMemo(
    () =>
      [
        { icon: Bell, key: "alerts" as const },
        { icon: Heart, key: "records" as const },
        { icon: Search, key: "places" as const },
        { icon: Tag, key: "free" as const },
      ] as const,
    [],
  );

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "MobileApplication",
        name: "PetWell",
        operatingSystem: "iOS, Android",
        applicationCategory: "LifestyleApplication",
        url: "https://petwellhk.com/download",
        downloadUrl: [APP_STORE_URL, PLAY_STORE_URL],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "HKD",
        },
        description: t("download.seo.description"),
      },
    ],
    [t],
  );

  useSEO({
    title: t("download.seo.title"),
    description: t("download.seo.description"),
    keywords: t("download.seo.keywords"),
    canonicalUrl: "https://petwellhk.com/download",
    structuredData,
    faqItems,
    speakableSelectors: ["h1", ".download-subtitle"],
  });

  return (
    <div className={cn("min-h-screen bg-background", isMobileStore && "pb-24 md:pb-0")}>
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="home-hero-bg pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className="container relative mx-auto px-4 py-14 md:py-20 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
              <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
                <p className="home-reveal home-section-label">{t("download.eyebrow")}</p>

                <h1 className="home-reveal home-reveal-delay-1 mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.5rem]">
                  <span className="block">{t("download.title")}</span>
                  <span className="mt-1 block font-['Instrument_Serif',Georgia,serif] text-[1.15em] font-normal italic text-primary">
                    {t("download.titleHighlight")}
                  </span>
                </h1>

                <p className="download-subtitle home-reveal home-reveal-delay-2 mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg lg:mx-0">
                  {t("download.subtitle")}
                </p>

                <div className="home-reveal home-reveal-delay-3 mt-8 flex flex-col items-center gap-5 lg:items-start">
                  {isMobileStore ? (
                    <Button
                      asChild
                      size="lg"
                      className="h-12 min-h-12 w-full max-w-sm px-8 text-base shadow-soft"
                    >
                      <a href={primaryStoreUrl} rel="noopener noreferrer">
                        {t(primaryLabelKey(platform))}
                      </a>
                    </Button>
                  ) : null}

                  <StoreBadges platform={platform} />
                </div>

                <dl className="home-reveal home-reveal-delay-4 mx-auto mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-8 lg:mx-0">
                  <div className="text-center lg:text-left">
                    <dt className="home-stat-value text-2xl font-bold text-foreground md:text-3xl">200+</dt>
                    <dd className="mt-1 text-xs text-muted-foreground md:text-sm">{t("home.stats.clinicsLabel")}</dd>
                  </div>
                  <div className="text-center lg:text-left">
                    <dt className="home-stat-value text-2xl font-bold text-foreground md:text-3xl">1500+</dt>
                    <dd className="mt-1 text-xs text-muted-foreground md:text-sm">{t("home.stats.restaurantsLabel")}</dd>
                  </div>
                  <div className="text-center lg:text-left">
                    <dt className="home-stat-value text-2xl font-bold text-foreground md:text-3xl">100%</dt>
                    <dd className="mt-1 text-xs text-muted-foreground md:text-sm">{t("home.stats.freeLabel")}</dd>
                  </div>
                </dl>
              </div>

              <div className="home-reveal home-reveal-delay-2 hidden lg:block">
                <div className="relative">
                  <img
                    src={appPreviewAbout}
                    alt={t("download.previewAlt")}
                    className="mx-auto h-auto w-full"
                    width={1024}
                    height={576}
                    decoding="async"
                  />

                  <aside className="absolute bottom-4 right-4 flex items-center gap-3 rounded-xl border border-border bg-background/95 p-3 shadow-soft backdrop-blur-sm">
                    <img
                      src={downloadQr}
                      alt={t("download.scanLabel")}
                      width={88}
                      height={88}
                      className="h-[88px] w-[88px] rounded-md bg-white p-1"
                    />
                    <div className="pr-1">
                      <p className="text-sm font-semibold text-foreground">{t("download.scanLabel")}</p>
                      <p className="mt-0.5 max-w-[9.5rem] text-xs leading-snug text-muted-foreground">
                        {t("download.scanHint")}
                      </p>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MediaLogoMarquee featured />

        <section className="border-b border-border py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="home-section-label">{t("download.whyEyebrow")}</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{t("download.whyTitle")}</h2>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
              {reasons.map((reason) => (
                <article key={reason.key} className="home-bento-feature p-6 md:p-8">
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary/60">
                    <reason.icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                    {t(`download.reasons.${reason.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {t(`download.reasons.${reason.key}.description`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 rounded-xl border border-border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="max-w-xl">
                <p className="home-section-label">{t("download.ctaTitle")}</p>
                <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">{t("download.ctaDescription")}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <li>{t("download.feature1")}</li>
                  <li>{t("download.feature2")}</li>
                  <li>{t("download.feature3")}</li>
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">{t("download.disclaimer")}</p>
              </div>
              <Button asChild variant="outline" size="lg" className="h-12 min-h-12 shrink-0 px-6">
                <a href={NAMETAG_FORM_URL} target="_blank" rel="noopener noreferrer">
                  <Gift className="h-4 w-4" aria-hidden />
                  {t("download.ctaButton")}
                </a>
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <FAQSection items={faqItems} title={t("download.faqTitle")} />
        </div>
      </main>

      {isMobileStore ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
          <Button asChild size="lg" className="h-12 min-h-12 w-full text-base shadow-soft">
            <a href={primaryStoreUrl} rel="noopener noreferrer">
              {t(primaryLabelKey(platform))}
            </a>
          </Button>
        </div>
      ) : null}

      <Footer />
    </div>
  );
};

function StoreBadges({ platform }: { platform: StorePlatform }) {
  const { t } = useTranslation();
  const iosFirst = platform !== "android";

  const badges = [
    {
      id: "ios" as const,
      href: APP_STORE_URL,
      src: appStoreBadge,
      alt: t("download.appStoreAlt"),
    },
    {
      id: "android" as const,
      href: PLAY_STORE_URL,
      src: googlePlayBadge,
      alt: t("download.playStoreAlt"),
    },
  ];

  const ordered = iosFirst ? badges : [badges[1], badges[0]];

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
      <span className="sr-only">{t("download.storesLabel")}</span>
      {ordered.map((badge) => {
        const recommended =
          (platform === "ios" && badge.id === "ios") || (platform === "android" && badge.id === "android");

        return (
          <a
            key={badge.id}
            href={badge.href}
            target={platform === "desktop" ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={cn(
              "relative w-[168px] rounded-lg transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              recommended && "ring-2 ring-primary/35 ring-offset-2",
            )}
          >
            {recommended ? (
              <span className="absolute -top-2.5 left-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                {t("download.recommended")}
              </span>
            ) : null}
            <img src={badge.src} alt={badge.alt} className="h-auto w-full object-contain" />
          </a>
        );
      })}
    </div>
  );
}

export default Download;
