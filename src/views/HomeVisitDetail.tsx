"use client";

import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CalendarCheck2,
  ChevronDown,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useHomeVisitProvider } from "@/hooks/useHomeVisitProviders";
import { useSEO } from "@/hooks/useSEO";
import { ClinicImage } from "@/components/ClinicImage";
import { AppDownloadCTA } from "@/components/AppDownloadCTA";
import PlaceReportModal from "@/components/PlaceReportModal";
import DiscoverPlaceTabs from "@/components/DiscoverPlaceTabs";
import {
  formatCoverageSummary,
  getServiceCategoryLabel,
  getSpeciesLabel,
  getWhatsAppUrl,
  formatPriceAmount,
  transformHomeVisitProvider,
} from "@/services/homeVisitApi";
import {
  getFormattedHoursForDay,
  getTodayOpeningHours,
  localizeOpeningHoursText,
  normalizeAvailableHours,
} from "@/utils/availableHours";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const HomeVisitDetail = () => {
  const { providerId } = useParams();
  const { i18n, t } = useTranslation();
  const { data: apiProvider, isLoading, error } = useHomeVisitProvider(providerId);
  const lang: "zh" | "en" = i18n.language === "en" ? "en" : "zh";
  const [hoursOpen, setHoursOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const provider = useMemo(
    () => (apiProvider ? transformHomeVisitProvider(apiProvider, i18n.language) : null),
    [apiProvider, i18n.language],
  );

  const normalizedHours = useMemo(
    () => normalizeAvailableHours(provider?.availableHours),
    [provider?.availableHours],
  );
  const todayHours = getTodayOpeningHours(
    provider?.availableHours,
    provider?.is247,
    t,
  );
  const hoursSummary =
    localizeOpeningHoursText(
      todayHours || provider?.hoursSummary || null,
      i18n.language,
    ) || null;
  const hasDaySlots = useMemo(
    () => DAYS.some((day) => (normalizedHours?.[day]?.length ?? 0) > 0),
    [normalizedHours],
  );

  const whatsappUrl = getWhatsAppUrl(provider?.whatsapp);
  const coverageDetails = provider?.serviceCoverage;

  const servicesByCategory = useMemo(() => {
    if (!provider) return [];
    const map = new Map<string, typeof provider.services>();
    for (const service of provider.services) {
      const key = service.category || "other";
      const list = map.get(key) || [];
      list.push(service);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [provider]);

  const structuredData = useMemo(() => {
    if (!provider) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: provider.name,
      description: provider.description || provider.coverageSummary,
      telephone: provider.phone || undefined,
      email: provider.email || undefined,
      url: `https://petwellhk.com/home-visits/${providerId}`,
      image: provider.image || undefined,
      areaServed: provider.coverageSummary,
      ...(provider.rating > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: provider.rating,
          bestRating: 5,
          reviewCount: provider.totalReviews || 0,
        },
      }),
    };
  }, [provider, providerId]);

  useSEO({
    title: provider
      ? `${provider.name}｜香港寵物上門服務｜PetWell HK`
      : "寵物上門服務詳情｜PetWell HK",
    description: provider
      ? `${provider.name}提供寵物上門服務。服務範圍：${provider.coverageSummary}。${
          provider.description ? provider.description.slice(0, 80) : "WhatsApp／電話查詢預約。"
        }`
      : "查看香港寵物上門服務詳細資料、服務範圍同聯絡方式",
    keywords: provider
      ? `${provider.name},寵物上門,${provider.district || "香港"}上門獸醫,home visit`
      : "寵物上門服務,香港上門獸醫",
    canonicalUrl: `https://petwellhk.com/home-visits/${providerId}`,
    structuredData,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center py-16 md:py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !provider || !apiProvider) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h1 className="mb-4 text-3xl font-bold">
              {t("homeVisitPlaces.detail.notFound")}
            </h1>
            <Link to="/home-visits">
              <Button>{t("homeVisitPlaces.backToList")}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const gallery =
    provider.gallery.length > 0
      ? provider.gallery
      : provider.image
        ? [provider.image]
        : [];

  return (
    <div className="flex min-h-screen flex-col pb-20 lg:pb-0">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 py-6 md:py-10">
          <DiscoverPlaceTabs className="mb-6" />

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              <ClinicImage
                imageKey={gallery[0] || provider.image}
                alt={provider.name}
                className="h-full w-full"
              />
            </div>

            <div className="space-y-4 p-5 md:p-7">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("homeVisitPlaces.pageTitle")}
                </p>
                {provider.is247 ? (
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {t("homeVisitPlaces.filter24Hour")}
                    </Badge>
                  </div>
                ) : null}
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {provider.name}
                </h1>
                {provider.rating > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    ★ {provider.rating.toFixed(1)}
                    {provider.totalReviews > 0
                      ? ` · ${t("homeVisitPlaces.detail.reviews", {
                          count: provider.totalReviews,
                        })}`
                      : ""}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("homeVisitPlaces.detail.whatsapp")}
                  </a>
                )}
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold"
                  >
                    <Phone className="h-4 w-4" />
                    {t("homeVisitPlaces.detail.call")}
                  </a>
                )}
                {provider.bookingUrl && (
                  <a
                    href={provider.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold"
                  >
                    <CalendarCheck2 className="h-4 w-4" />
                    {t("homeVisitPlaces.detail.bookOnline")}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-6">
              <section className="rounded-xl border border-border p-5">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t("homeVisitPlaces.detail.coverage")}
                </h2>
                <p className="text-base font-medium">
                  {formatCoverageSummary(
                    coverageDetails,
                    lang,
                    provider.district,
                  )}
                </p>
                {coverageDetails?.districts && coverageDetails.districts.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {coverageDetails.districts.map((district) => (
                      <Badge key={district} variant="outline">
                        {district}
                      </Badge>
                    ))}
                  </div>
                )}
                {coverageDetails?.notes && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {coverageDetails.notes}
                  </p>
                )}
                {coverageDetails?.travelFeeNote && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("homeVisitPlaces.detail.travelFee")}: {coverageDetails.travelFeeNote}
                  </p>
                )}
                {provider.address ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t("homeVisitPlaces.address")}: {provider.address}
                  </p>
                ) : null}
              </section>

              {provider.description ? (
                <section className="rounded-xl border border-border p-5">
                  <h2 className="mb-3 text-lg font-semibold">
                    {t("homeVisitPlaces.detail.about")}
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {provider.description}
                  </p>
                </section>
              ) : null}

              {servicesByCategory.length > 0 ? (
                <section className="rounded-xl border border-border p-5">
                  <h2 className="text-lg font-semibold">
                    {t("homeVisitPlaces.detail.services")}
                  </h2>
                  <p className="mt-1 mb-4 text-sm leading-relaxed text-muted-foreground">
                    {t("homeVisitPlaces.detail.referenceDisclaimer")}
                  </p>
                  <div className="space-y-5">
                    {servicesByCategory.map(([category, items]) => (
                      <div key={category}>
                        <h3 className="mb-2 text-sm font-semibold text-foreground">
                          {getServiceCategoryLabel(category, lang)}
                        </h3>
                        <ul className="space-y-2">
                          {items.map((service, index) => {
                            const name =
                              (lang === "en"
                                ? service.name?.en || service.name?.zh
                                : service.name?.zh || service.name?.en) ||
                              getServiceCategoryLabel(service.category, lang);
                            return (
                              <li
                                key={`${category}-${index}-${name}`}
                                className="rounded-lg bg-muted/40 px-3 py-2 text-sm"
                              >
                                <div className="font-medium">{name}</div>
                                {service.description ? (
                                  <p className="mt-1 text-muted-foreground">
                                    {service.description}
                                  </p>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : provider.serviceOfferings.length > 0 ? (
                <section className="rounded-xl border border-border p-5">
                  <h2 className="text-lg font-semibold">
                    {t("homeVisitPlaces.detail.services")}
                  </h2>
                  <p className="mt-1 mb-3 text-sm leading-relaxed text-muted-foreground">
                    {t("homeVisitPlaces.detail.referenceDisclaimer")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {provider.serviceOfferings.map((offering) => (
                      <Badge key={offering} variant="outline">
                        {offering}
                      </Badge>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-xl border border-border p-5">
                <h2 className="text-lg font-semibold">
                  {t("homeVisitPlaces.detail.pricing")}
                </h2>
                <p className="mt-1 mb-3 text-sm leading-relaxed text-muted-foreground">
                  {t("homeVisitPlaces.detail.referenceDisclaimer")}
                </p>
                {provider.pricing.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {provider.pricing.map((row, index) => {
                      const amount =
                        row.rawText?.trim() ||
                        formatPriceAmount(
                          row.currency,
                          row.amountMin,
                          row.amountMax,
                          lang,
                        ) ||
                        null;
                      const meta = [
                        getServiceCategoryLabel(row.serviceCategory, lang),
                        row.includesTravel
                          ? t("homeVisitPlaces.detail.includesTravel")
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · ");
                      const notes =
                        row.notes?.trim() && row.notes.trim() !== amount
                          ? row.notes.trim()
                          : null;

                      return (
                        <li
                          key={`${row.label}-${index}`}
                          className="space-y-1 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <div className="min-w-0">
                              <p className="font-medium leading-snug">{row.label}</p>
                              {meta ? (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {meta}
                                </p>
                              ) : null}
                            </div>
                            {amount ? (
                              <p className="text-sm font-semibold leading-relaxed break-words text-primary sm:max-w-[45%] sm:text-right">
                                {amount}
                              </p>
                            ) : null}
                          </div>
                          {notes ? (
                            <p className="text-sm leading-relaxed break-words text-muted-foreground">
                              {notes}
                            </p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("homeVisitPlaces.detail.pricingEmpty")}
                  </p>
                )}
              </section>

              {(provider.speciesServed.length > 0 || hoursSummary || hasDaySlots) && (
                <section className="rounded-xl border border-border p-5">
                  {provider.speciesServed.length > 0 && (
                    <div className="mb-5">
                      <h2 className="mb-3 text-lg font-semibold">
                        {t("homeVisitPlaces.detail.species")}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {provider.speciesServed.map((species) => (
                          <Badge key={species} variant="secondary">
                            {getSpeciesLabel(species, lang)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(hoursSummary || hasDaySlots) && (
                    <div>
                      <h2 className="mb-3 text-lg font-semibold">
                        {t("homeVisitPlaces.openingHours")}
                      </h2>
                      {hoursSummary && (
                        <p className="text-sm text-muted-foreground">{hoursSummary}</p>
                      )}
                      {hasDaySlots && (
                        <Collapsible open={hoursOpen} onOpenChange={setHoursOpen}>
                          <CollapsibleTrigger className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                            {hoursOpen
                              ? t("homeVisitPlaces.detail.hideFullHours")
                              : t("homeVisitPlaces.detail.viewFullHours")}
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                hoursOpen ? "rotate-180" : ""
                              }`}
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                            {DAYS.map((day) => (
                              <div key={day} className="flex justify-between gap-4">
                                <span>{t(`hours.${day}`)}</span>
                                <span>
                                  {getFormattedHoursForDay(normalizedHours, day) ||
                                    t("homeVisitPlaces.closed")}
                                </span>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  )}
                </section>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <h2 className="mb-3 text-sm font-semibold">
                  {t("homeVisitPlaces.detail.contact")}
                </h2>
                <div className="space-y-2">
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t("homeVisitPlaces.detail.whatsapp")}
                    </a>
                  )}
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      {provider.phone}
                    </a>
                  )}
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <Globe className="h-4 w-4" />
                      {t("homeVisitPlaces.website")}
                    </a>
                  )}
                  {provider.instagram && (
                    <a
                      href={provider.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </a>
                  )}
                  {provider.facebook && (
                    <a
                      href={provider.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </a>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setReportOpen(true)}
              >
                {t("homeVisitPlaces.detail.report")}
              </Button>

              <div className="rounded-xl border border-border p-4">
                <AppDownloadCTA title={t("homeVisitPlaces.ctaTitle")} />
              </div>

              <Link
                to="/home-visits"
                className="inline-flex text-sm font-medium text-primary hover:underline"
              >
                ← {t("homeVisitPlaces.backToList")}
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <div
        className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden"
        role="toolbar"
        aria-label="Quick actions"
      >
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            {t("homeVisitPlaces.detail.whatsapp")}
          </a>
        )}
        {provider.phone && (
          <a
            href={`tel:${provider.phone}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold"
          >
            <Phone className="h-4 w-4" />
            {t("homeVisitPlaces.detail.call")}
          </a>
        )}
        {!whatsappUrl && !provider.phone && provider.bookingUrl && (
          <a
            href={provider.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <CalendarCheck2 className="h-4 w-4" />
            {t("homeVisitPlaces.detail.bookOnline")}
          </a>
        )}
      </div>

      <Footer />

      <PlaceReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        placeId={provider.id}
        placeName={provider.name}
        placeType="homeVisit"
      />
    </div>
  );
};

export default HomeVisitDetail;
