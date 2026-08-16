"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/components/AppDownloadCTA";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

const appStoreBadge = "/assets/store-badges/app-store.svg";
const googlePlayBadge = "/assets/store-badges/google-play.svg";
const downloadQr = "/assets/download-qr.svg";

type StorePlatform = "ios" | "android" | "desktop";

function detectStorePlatform(): StorePlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || navigator.vendor || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

const Download = () => {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<StorePlatform>("desktop");

  useEffect(() => {
    setPlatform(detectStorePlatform());
  }, []);

  const isDesktop = platform === "desktop";

  useSEO({
    title: t("download.seo.title"),
    description: t("download.seo.description"),
    keywords: t("download.seo.keywords"),
    canonicalUrl: "https://petwellhk.com/download",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      name: "PetWell",
      operatingSystem: "iOS, Android",
      applicationCategory: "LifestyleApplication",
      url: "https://petwellhk.com/download",
      downloadUrl: [APP_STORE_URL, PLAY_STORE_URL],
      offers: { "@type": "Offer", price: "0", priceCurrency: "HKD" },
      description: t("download.seo.description"),
    },
    speakableSelectors: ["h1", ".download-subtitle"],
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16 md:py-24">
        <div className="home-hero-bg pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-lg text-center">
          <p className="home-reveal home-section-label">{t("download.eyebrow")}</p>

          <h1 className="home-reveal home-reveal-delay-1 mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
            {t("download.title")}
            <span className="mt-1 block font-['Instrument_Serif',Georgia,serif] text-[1.12em] font-normal italic text-primary">
              {t("download.titleHighlight")}
            </span>
          </h1>

          <p className="download-subtitle home-reveal home-reveal-delay-2 mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("download.subtitle")}
          </p>

          <div className="home-reveal home-reveal-delay-3 mt-10">
            <StoreBadges platform={platform} />
          </div>

          {isDesktop ? (
            <div className="home-reveal home-reveal-delay-3 mx-auto mt-10 flex max-w-sm items-center gap-4 rounded-xl border border-border bg-background/80 p-4 text-left">
              <img
                src={downloadQr}
                alt={t("download.scanLabel")}
                width={96}
                height={96}
                className="h-24 w-24 shrink-0 rounded-md bg-white p-1"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">{t("download.scanLabel")}</p>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">{t("download.scanHint")}</p>
              </div>
            </div>
          ) : null}

          <p className="home-reveal home-reveal-delay-4 mt-10 text-sm text-muted-foreground">
            <Link
              to="/about"
              className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {t("download.aboutCta")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </p>
        </div>
      </main>

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
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="sr-only">{t("download.storesLabel")}</span>
      {ordered.map((badge) => (
        <a
          key={badge.id}
          href={badge.href}
          target={platform === "desktop" ? "_blank" : undefined}
          rel="noopener noreferrer"
          className={cn(
            "inline-flex h-12 w-[162px] items-center justify-center rounded-lg transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <img src={badge.src} alt={badge.alt} className="h-12 w-[162px] object-contain" />
        </a>
      ))}
    </div>
  );
}

export default Download;
