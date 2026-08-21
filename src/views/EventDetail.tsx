"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  ExternalLink,
  Grid3x3,
  Heart,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Maximize2,
  Share2,
  Tag,
  User,
  Users,
  X,
} from "lucide-react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import useSEO from "@/hooks/useSEO";
import {
  calculateEventStatus,
  fetchEventById,
  getAttendeeCount,
  type EventStatus,
  type OrganizedEvent,
} from "@/services/eventApi";
import { cn } from "@/lib/utils";

type EventI18n = {
  zh?: Partial<Record<"name" | "description" | "remark" | "address" | "district", string>>;
  en?: Partial<Record<"name" | "description" | "remark" | "address" | "district", string>>;
};

const categoryKeys = [
  "ADOPTION",
  "MARKET",
  "EXPO",
  "WORKSHOP",
  "CHARITY",
  "MEETUP",
  "PET_FRIENDLY",
  "OTHER",
] as const;

const categoryStyles: Record<string, string> = {
  ADOPTION: "bg-rose-100 text-rose-800 border-rose-200",
  MARKET: "bg-amber-100 text-amber-800 border-amber-200",
  EXPO: "bg-violet-100 text-violet-800 border-violet-200",
  WORKSHOP: "bg-sky-100 text-sky-800 border-sky-200",
  CHARITY: "bg-emerald-100 text-emerald-800 border-emerald-200",
  MEETUP: "bg-orange-100 text-orange-800 border-orange-200",
  PET_FRIENDLY: "bg-teal-100 text-teal-800 border-teal-200",
  OTHER: "bg-muted text-muted-foreground border-border",
};

const EventDetail = ({ initialEvent = null }: { initialEvent?: OrganizedEvent | null }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [event, setEvent] = useState<OrganizedEvent | null>(initialEvent);
  const [loading, setLoading] = useState(!initialEvent);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError(t("event.detail.invalidId"));
        setLoading(false);
        return;
      }

      try {
        if (!initialEvent) setLoading(true);
        setError(null);
        const eventData = await fetchEventById(id);
        setEvent(eventData);
        if (!eventData) setError(t("event.detail.notFound"));
      } catch (err) {
        console.error("Error loading event:", err);
        setError(t("event.detail.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, t]);

  const parsedI18n = useMemo(() => parseEventI18n(event?.i18n), [event?.i18n]);
  const isEnglish = i18n.language === "en";
  const localized = useMemo(() => {
    if (!event) return null;
    const lang = isEnglish ? parsedI18n?.en : parsedI18n?.zh;
    return {
      name: lang?.name || event.name,
      description: lang?.description || event.description || "",
      remark: lang?.remark || event.remark || "",
      address: lang?.address || event.address || "",
      district: lang?.district || event.district || "",
    };
  }, [event, isEnglish, parsedI18n]);

  const cleanDescription = stripHtml(localized?.description || "").substring(0, 160) || t("event.detail.defaultSeoDescription");
  const organizerName = event?.organizerName || event?.organizer?.name || event?.organizerEmail || t("event.detail.unknownOrganizer");

  useSEO({
    title: event && localized ? `${localized.name} | PetWell Events` : "Event | PetWell",
    description: cleanDescription,
    keywords: event && localized ? `${localized.name}, pet event, ${event.category || "pet activities"}, Hong Kong, ${event.location}` : "pet event, Hong Kong",
    canonicalUrl: event ? `https://petwellhk.com/event/${event.id}` : undefined,
    ogImage: event?.photos?.[0],
    structuredData: event && localized ? {
      "@context": "https://schema.org",
      "@type": "Event",
      name: localized.name,
      description: cleanDescription,
      startDate: event.dateTime,
      endDate: event.deadline || undefined,
      location: {
        "@type": "Place",
        name: event.location || localized.address,
        address: {
          "@type": "PostalAddress",
          streetAddress: localized.address || event.location || undefined,
          addressLocality: localized.district || "Hong Kong",
          addressCountry: "HK",
        },
      },
      organizer: {
        "@type": "Organization",
        name: organizerName,
      },
      image: event.photos?.[0],
      offers: {
        "@type": "Offer",
        price: event.price || 0,
        priceCurrency: "HKD",
        availability: "https://schema.org/InStock",
        url: event.redirected_url || undefined,
      },
    } : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event || !localized) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <Card className="max-w-md p-8 text-center">
            <p className="mb-4 text-muted-foreground">{error || t("event.detail.notFound")}</p>
            <Button onClick={() => navigate("/pet-activities")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("event.detail.backToEvents")}
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const status = calculateEventStatus(event);
  const eventDate = event.dateTime ? new Date(event.dateTime) : null;
  const eventEndDate = event.deadline ? new Date(event.deadline) : null;
  const isFree = !event.paymentRequired || (event.price || 0) === 0;
  const isUnlimited = !event.capacity || event.capacity <= 0;
  const attendeeCount = getAttendeeCount(event);
  const availableSpots = isUnlimited ? null : Math.max(0, (event.capacity || 0) - attendeeCount);
  const categoryLabel = getCategoryLabel(t, event.category);
  const safeDescription = sanitizeEventHtml(localized.description);
  const safeRemark = sanitizeEventHtml(buildRemarkWithFallback(localized.remark, event.redirected_url));

  const handleShare = async () => {
    const eventUrl = window.location.href;
    const shareText = `${localized.name}\n\n${cleanDescription}\n\n${eventUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: localized.name, text: shareText, url: eventUrl });
        return;
      } catch {
        // User cancelled or the browser rejected share; fallback to clipboard.
      }
    }

    await navigator.clipboard.writeText(shareText).catch(() => navigator.clipboard.writeText(eventUrl));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <Button variant="ghost" onClick={() => navigate("/pet-activities")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("event.detail.backToEvents")}
          </Button>
        </div>
      </div>

      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-amber-50/60">
        <div className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-12">
          <div className="flex flex-col justify-center">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className={cn("border", getStatusClass(status))}>
                {status === "upcoming" || status === "startingSoon" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : null}
                {t(`event.status.${status}`)}
              </Badge>
              {event.category ? (
                <Badge variant="outline" className={cn("border", categoryStyles[event.category] || categoryStyles.OTHER)}>
                  <Tag className="mr-1 h-3 w-3" />
                  {categoryLabel}
                </Badge>
              ) : null}
              {event.redirection && event.redirected_url ? (
                <a href={event.redirected_url} target="_blank" rel="noopener noreferrer">
                  <Badge variant="secondary" className="cursor-pointer gap-1 transition hover:bg-primary hover:text-primary-foreground">
                    <ExternalLink className="h-3 w-3" />
                    {t("event.detail.officialInfo")}
                  </Badge>
                </a>
              ) : null}
            </div>

            <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {localized.name}
            </h1>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoTile icon={Calendar} label={t("event.detail.date")} value={eventDate ? formatDate(eventDate, i18n.language) : t("event.detail.notProvided")} />
              <InfoTile icon={MapPin} label={t("event.detail.location")} value={event.location || localized.address || t("event.detail.notProvided")} />
              <InfoTile icon={User} label={t("event.detail.organizer")} value={organizerName} />
              <InfoTile icon={DollarSign} label={t("event.detail.price")} value={isFree ? t("event.detail.free") : `HKD ${event.price?.toFixed(2)}`} />
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border bg-muted shadow-2xl">
              {event.photos?.[0] ? (
                <img src={event.photos[0]} alt={localized.name} className="h-full w-full object-cover" loading="eager" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-20 w-20 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="absolute right-4 top-4 flex gap-2">
              <Button variant="secondary" size="icon" onClick={handleShare} className="rounded-full bg-background/85 shadow">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={() => setIsLiked(!isLiked)} className="rounded-full bg-background/85 shadow">
                <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">{t("event.detail.aboutEvent")}</h2>
              </CardHeader>
              <CardContent>
                <SafeHtml className="prose prose-sm max-w-none text-foreground sm:prose-base" html={safeDescription} />
              </CardContent>
            </Card>

            {safeRemark ? (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">{t("event.detail.remark")}</h2>
                </CardHeader>
                <CardContent>
                  <SafeHtml className="prose prose-sm max-w-none rounded-2xl bg-muted/40 p-4 text-muted-foreground" html={safeRemark} />
                </CardContent>
              </Card>
            ) : null}

            {event.photos?.length ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Grid3x3 className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-semibold">{t("event.detail.photos")}</h2>
                    <Badge variant="secondary">{event.photos.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {event.photos.map((photo, index) => (
                      <button
                        key={`${photo}-${index}`}
                        type="button"
                        className="group relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted"
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                      >
                        <img src={photo} alt={`${localized.name} ${index + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading={index === 0 ? "eager" : "lazy"} />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                          <Maximize2 className="h-7 w-7 text-white" />
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <div className="text-center text-3xl font-bold text-primary">
                  {isFree ? t("event.detail.free") : `HKD ${event.price?.toFixed(2)}`}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <SidebarRow icon={Calendar} label={t("event.detail.date")} value={eventDate ? formatDateTime(eventDate, i18n.language) : t("event.detail.notProvided")} />
                {eventEndDate ? <SidebarRow icon={Clock} label={t("event.detail.endDate")} value={formatDateTime(eventEndDate, i18n.language)} /> : null}
                {event.openTime || event.closeTime ? <SidebarRow icon={Clock} label={t("event.detail.hours")} value={[event.openTime, event.closeTime].filter(Boolean).join(" - ")} /> : null}
                <SidebarRow icon={MapPin} label={t("event.detail.where")} value={[event.location, localized.district].filter(Boolean).join(" · ") || t("event.detail.notProvided")} />
                <SidebarRow icon={Users} label={t("event.detail.availability")} value={isUnlimited ? t("event.detail.unlimited") : availableSpots !== null ? t("event.detail.spotsLeft", { count: availableSpots }) : t("event.detail.notProvided")} />
                <Separator />
                {event.redirected_url ? (
                  <a href={event.redirected_url} target="_blank" rel="noopener noreferrer">
                    <Button className="h-12 w-full rounded-xl text-base font-semibold">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t("event.detail.openOfficialLink")}
                    </Button>
                  </a>
                ) : (
                  <Button className="h-12 w-full rounded-xl text-base font-semibold" disabled>
                    {t("event.detail.noOfficialLink")}
                  </Button>
                )}
              </CardContent>
            </Card>

          </aside>
        </div>
      </main>

      {event.photos?.length ? (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="h-[95vh] w-full max-w-7xl gap-0 border-none bg-black/95 p-0">
            <div className="relative flex h-full w-full items-center justify-center">
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-50 rounded-full text-white hover:bg-white/20" onClick={() => setLightboxOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
              {lightboxIndex > 0 ? (
                <Button variant="ghost" size="icon" className="absolute left-4 z-50 h-12 w-12 rounded-full text-white hover:bg-white/20" onClick={() => setLightboxIndex((prev) => Math.max(0, prev - 1))}>
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              ) : null}
              {lightboxIndex < event.photos.length - 1 ? (
                <Button variant="ghost" size="icon" className="absolute right-4 z-50 h-12 w-12 rounded-full text-white hover:bg-white/20" onClick={() => setLightboxIndex((prev) => Math.min(event.photos.length - 1, prev + 1))}>
                  <ChevronRight className="h-6 w-6" />
                </Button>
              ) : null}
              <img src={event.photos[lightboxIndex]} alt={`${localized.name} ${lightboxIndex + 1}`} className="max-h-full max-w-full rounded-lg object-contain p-4 sm:p-8" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur">
                {lightboxIndex + 1} / {event.photos.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      <Footer />
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) => (
  <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </div>
    <div className="break-words font-semibold">{value}</div>
  </div>
);

const SidebarRow = ({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) => (
  <div className="flex gap-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  </div>
);

const SafeHtml = ({ html, className }: { html: string; className?: string }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeEventHtml(html) }} />
);

function parseEventI18n(value: OrganizedEvent["i18n"]): EventI18n | null {
  if (!value) return null;
  if (typeof value === "object") return value as EventI18n;
  try {
    return JSON.parse(value) as EventI18n;
  } catch {
    return null;
  }
}

function sanitizeEventHtml(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/javascript:/gi, "");
}

function buildRemarkWithFallback(remark?: string | null, url?: string | null): string {
  if (!url || remark?.includes("<a")) return remark || "";
  const link = `<a href="${escapeHtml(url)}">官方連結</a>`;
  return remark ? `${remark}<br>${link}` : link;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getStatusClass(status: EventStatus): string {
  const classes: Record<EventStatus, string> = {
    startingSoon: "bg-amber-500 text-white",
    upcoming: "bg-primary text-primary-foreground",
    ongoing: "bg-green-500 text-white",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-muted text-muted-foreground",
  };
  return classes[status];
}

function getCategoryLabel(t: ReturnType<typeof useTranslation>["t"], category?: string | null): string {
  const normalized = category && categoryKeys.includes(category as typeof categoryKeys[number]) ? category : "OTHER";
  return t(`event.categories.${normalized}`);
}

function formatDate(date: Date, language: string): string {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-HK" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function formatDateTime(date: Date, language: string): string {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-HK" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default EventDetail;
