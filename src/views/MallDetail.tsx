"use client";

import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Dog,
  Footprints,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Train,
} from "lucide-react";
import { useMall } from "@/hooks/useMalls";
import { useSEO } from "@/hooks/useSEO";
import { MallImage } from "@/components/MallImage";
import { MallDetailHero } from "@/components/mall/MallDetailHero";
import { MallPolicySection } from "@/components/mall/MallPolicySection";
import { MallVisitActions } from "@/components/mall/MallVisitActions";
import { PetWellVerifiedBadge } from "@/components/PetWellVerifiedBadge";
import { AppDownloadCTA } from "@/components/AppDownloadCTA";

import {
  getMallMovementLabel,
  getMallPetsAllowedLabel,
  transformMall,
  type ApiMall,
} from "@/services/mallApi";
import {
  getFormattedHoursForDay,
  getTodayOpeningHours,
  localizeOpeningHoursText,
  normalizeAvailableHours,
} from "@/utils/availableHours";
import { getGoogleMapsEmbedUrl, getGoogleMapsUrl } from "@/utils/placeMaps";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const MallDetail = ({ initialMall = null }: { initialMall?: ApiMall | null }) => {
  const { mallId } = useParams();
  const { i18n, t } = useTranslation();
  const { data: apiMall, isLoading, error } = useMall(mallId, initialMall);
  const lang: "zh" | "en" = i18n.language === "en" ? "en" : "zh";
  const [hoursOpen, setHoursOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const img = target.closest("img") as HTMLImageElement | null;
    if (!img) return;
    if (img.closest("a")) return;
    if (!img.closest(".mall-hero, .mall-gallery-tile")) return;
    if (img.naturalWidth && img.naturalWidth < 80) return;
    const src = img.currentSrc || img.getAttribute("src");
    if (!src) return;
    e.preventDefault();
    setLightboxSrc(src);
    setLightboxAlt(img.getAttribute("alt") || "");
    setLightboxOpen(true);
  }, []);

  const mall = useMemo(
    () => (apiMall ? transformMall(apiMall, i18n.language) : null),
    [apiMall, i18n.language],
  );

  const mallName = mall?.name || "";
  const mallAddress = mall?.address || "";
  const mallDistrict = mall?.district || "";

  const normalizedHours = useMemo(
    () => normalizeAvailableHours(mall?.availableHours),
    [mall?.availableHours],
  );
  const todayHours = getTodayOpeningHours(mall?.availableHours, false, t);
  const hoursSummary =
    localizeOpeningHoursText(
      todayHours || mall?.hoursSummary || null,
      i18n.language,
    ) || null;
  const hasDaySlots = useMemo(
    () => DAYS.some((day) => (normalizedHours?.[day]?.length ?? 0) > 0),
    [normalizedHours],
  );

  const mapsUrl = useMemo(() => {
    if (mall?.googleMapsUrl) return mall.googleMapsUrl;
    const queryAddress = [mallName, mallAddress].filter(Boolean).join(" ").trim();
    if (!queryAddress && !mall?.location) return null;
    return getGoogleMapsUrl(queryAddress || mallName, mall?.location ?? undefined);
  }, [mall, mallName, mallAddress]);

  const embedUrl = useMemo(() => {
    if (!mall) return null;
    const queryAddress = [mallName, mallAddress, mallDistrict]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (!queryAddress && !mall.location) return null;
    return getGoogleMapsEmbedUrl(queryAddress || mallName, mall.location ?? undefined);
  }, [mall, mallName, mallAddress, mallDistrict]);

  const structuredData = useMemo(() => {
    if (!mall) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "ShoppingCenter",
      name: mallName,
      address: {
        "@type": "PostalAddress",
        streetAddress: mallAddress,
        addressLocality: mallDistrict,
        addressRegion: "Hong Kong",
      },
      telephone: mall.phone || undefined,
      url: `https://petwellhk.com/malls/${mallId}`,
      image: mall.image || undefined,
      openingHours: mall.hoursSummary || undefined,
    };
  }, [mall, mallId, mallName, mallAddress, mallDistrict]);

  useSEO({
    title: mall
      ? `${mallName} | ${mallDistrict}寵物友善商場 | PetWell HK`
      : "寵物友善商場詳情 | PetWell HK",
    description: mall
      ? `${mallName}係${mallDistrict}寵物友善商場。${getMallMovementLabel(
          mall.petMovementMode,
          "zh",
        )}。地址：${mallAddress}。`
      : "查看香港寵物友善商場詳細資料及寵物政策",
    keywords: mall
      ? `${mallName}寵物友善,${mallDistrict}帶狗商場,${mallName}帶狗,寵物友善商場`
      : "寵物友善商場,帶狗入商場",
    canonicalUrl: `https://petwellhk.com/malls/${mallId}`,
    structuredData,
  });

  if (isLoading) {
    return (
      <div className="mall-page flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center py-16 md:py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !mall || !apiMall) {
    return (
      <div className="mall-page flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="mall-shell text-center">
            <h1 className="mall-title mb-4 text-3xl md:text-4xl">
              {t("mallPlaces.detail.notFound")}
            </h1>
            <Link to="/malls">
              <Button>{t("mallPlaces.backToList")}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const gallery = mall.gallery.length > 0 ? mall.gallery : mall.image ? [mall.image] : [];
  const heroUsesMosaic = gallery.length >= 3;
  const overviewGallery = heroUsesMosaic ? gallery.slice(5) : gallery.slice(1);
  const petsLabel = getMallPetsAllowedLabel(mall.petsAllowed, lang);
  const movementLabel = getMallMovementLabel(mall.petMovementMode, lang);

  const identityBlock = (layout: "mobile" | "desktop") => {
    const isDesktop = layout === "desktop";
    return (
      <div className={`flex flex-col ${isDesktop ? "h-full gap-5" : "gap-4"}`}>
        <div>
          <p className="mall-kicker mb-2">{t("mallPlaces.pageTitle")}</p>

          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            {mall.verified && <PetWellVerifiedBadge />}
            {mall.petsAllowed === "YES" && (
              <span className="mall-identity-pill mall-identity-pill--emphasis">
                <Dog className="h-3 w-3" aria-hidden />
                {petsLabel}
              </span>
            )}
            {mall.petMovementMode !== "UNKNOWN" && (
              <span className="mall-identity-pill">
                <Footprints className="h-3 w-3 opacity-70" aria-hidden />
                {movementLabel}
              </span>
            )}
          </div>

          <h1
            className={`mall-title text-foreground ${
              isDesktop ? "text-3xl xl:text-[2.15rem]" : "text-2xl md:text-3xl"
            }`}
          >
            {mallName}
          </h1>

          <div
            className={`mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[hsl(var(--mall-muted))] ${
              isDesktop ? "text-base" : "text-sm"
            }`}
          >
            {mallDistrict && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {mallDistrict}
              </span>
            )}
            {hoursSummary && (
              <>
                <span className="text-[hsl(var(--mall-line))]" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0" aria-hidden />
                  {hoursSummary}
                </span>
              </>
            )}
          </div>
        </div>

        {mall.listingAlert && (
          <div
            role="alert"
            className="flex gap-2.5 rounded-lg border border-[hsl(var(--mall-line))] bg-[hsl(var(--mall-canvas))] px-3.5 py-3 text-sm text-foreground"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="leading-relaxed">{mall.listingAlert}</p>
          </div>
        )}

        {isDesktop && (
          <div className="mt-auto">
            <MallVisitActions mall={mall} mapsUrl={mapsUrl} lang={lang} />
          </div>
        )}
      </div>
    );
  };

  const hoursBlock = (
    <div className="rounded-xl border border-[hsl(var(--mall-line))] bg-[hsl(var(--mall-canvas))]/70 px-3.5 py-3">
      <div className="flex items-start gap-2.5 text-sm">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{t("mallPlaces.openingHours")}</p>
          {hoursSummary && (
            <p className="mt-0.5 text-foreground/90">{hoursSummary}</p>
          )}
          {hasDaySlots && normalizedHours && (
            <Collapsible open={hoursOpen} onOpenChange={setHoursOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="mt-1 h-auto px-0 text-primary">
                  {hoursOpen
                    ? t("mallPlaces.detail.hideFullHours")
                    : t("mallPlaces.detail.viewFullHours")}
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform ${hoursOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-1 text-sm text-muted-foreground">
                {DAYS.map((day) => (
                  <div key={day} className="flex justify-between gap-3">
                    <span>{t(`hours.${day}`)}</span>
                    <span>
                      {getFormattedHoursForDay(normalizedHours, day) ||
                        t("mallPlaces.closed")}
                    </span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mall-page flex min-h-screen flex-col">
      <Header />
      <main className="flex-1" onClick={handleImageClick}>
        <div className="lg:hidden">
          <MallDetailHero
            backLabel={t("mallPlaces.backToList")}
            coverImageKey={mall.image}
            gallery={gallery}
            name={mallName}
          />
        </div>

        <div className="mall-shell">
          <nav className="mall-breadcrumb hidden lg:flex lg:pt-6" aria-label="Breadcrumb">
            <Link to="/" className="transition-colors hover:text-primary">
              PetWell HK
            </Link>
            <span className="mall-breadcrumb-sep" aria-hidden>
              /
            </span>
            <Link to="/malls" className="transition-colors hover:text-primary">
              {t("mallPlaces.pageTitle")}
            </Link>
            <span className="mall-breadcrumb-sep" aria-hidden>
              /
            </span>
            <span className="truncate font-medium text-foreground">{mallName}</span>
          </nav>

          <div className="mall-desktop-header">
            <div className="mall-reveal">
              <MallDetailHero
                backLabel={t("mallPlaces.backToList")}
                coverImageKey={mall.image}
                gallery={gallery}
                name={mallName}
                layout="desktop"
              />
            </div>
            <section className="mall-panel mall-identity-desktop mall-reveal mall-reveal-delay-1">
              {identityBlock("desktop")}
            </section>
          </div>

          <section className="mall-panel mall-reveal relative z-10 -mt-5 p-4 md:-mt-6 md:p-6 lg:hidden">
            {identityBlock("mobile")}
          </section>

          <div className="mall-content-grid">
            <div className="mall-main-column mall-reveal mall-reveal-delay-2">
              <section className="mall-panel p-4 md:p-6 xl:p-8">
                <MallPolicySection mall={mall} lang={lang} />
              </section>

              {overviewGallery.length > 0 && (
                <section className="mall-panel p-4 md:p-6">
                  <h2 className="mall-title mb-3 text-2xl">{t("mallPlaces.gallery")}</h2>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:gap-2">
                    {overviewGallery.slice(0, 8).map((src) => (
                      <div key={src} className="mall-gallery-tile aspect-square rounded-lg">
                        <MallImage imageKey={src} alt={mallName} className="h-full w-full" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>

            <aside className="mall-sidebar mall-reveal mall-reveal-delay-3">
              <section className="mall-panel space-y-4 p-4 md:p-5">
                <h2 className="text-base font-bold tracking-tight">
                  {t("mallPlaces.detail.planVisit")}
                </h2>

                {mallAddress && (
                  <div className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{mallAddress}</span>
                  </div>
                )}

                {mall.mtrAccess && (
                  <div className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <Train className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{mall.mtrAccess}</span>
                  </div>
                )}

                {(hoursSummary || hasDaySlots) && hoursBlock}

                <div className="lg:hidden">
                  <MallVisitActions mall={mall} mapsUrl={mapsUrl} lang={lang} />
                </div>
              </section>

              {embedUrl && (
                <div className="mall-panel overflow-hidden">
                  <iframe
                    title={`${mallName} map`}
                    src={embedUrl}
                    className="h-56 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              <div className="mall-panel hidden p-4 lg:block">
                <AppDownloadCTA title="下載 PetWell App，探索更多寵物友善商場" />
              </div>
            </aside>
          </div>

          <div className="mt-6 pb-4 lg:hidden">
            <div className="mall-panel p-4">
              <AppDownloadCTA title="下載 PetWell App，探索更多寵物友善商場" />
            </div>
          </div>
        </div>
      </main>

      <div className="mall-mobile-bar" role="toolbar" aria-label="Quick actions">
        {mall.phone && (
          <a
            href={`tel:${mall.phone}`}
            className="restaurant-action-btn restaurant-action-btn--primary"
          >
            <Phone className="h-4 w-4" />
            {t("mallPlaces.detail.callNow")}
          </a>
        )}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="restaurant-action-btn restaurant-action-btn--primary"
          >
            <Navigation className="h-4 w-4" />
            {t("mallPlaces.detail.getDirections")}
          </a>
        )}
        {!mall.phone && !mapsUrl && (
          <Link to="/malls" className="restaurant-action-btn restaurant-action-btn--primary">
            {t("mallPlaces.backToList")}
          </Link>
        )}
      </div>

      <Footer />

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[min(92vw,56rem)] border-none bg-black/95 p-2 sm:p-4">
          <DialogTitle className="sr-only">{lightboxAlt || mallName}</DialogTitle>
          {lightboxSrc && (
            <div className="flex items-center justify-center">
              <img
                src={lightboxSrc}
                alt={lightboxAlt || mallName}
                className="max-h-[85vh] w-full rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MallDetail;
