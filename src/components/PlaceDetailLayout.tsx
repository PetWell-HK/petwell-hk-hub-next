import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import { useMemo, useState, type ComponentType } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  MapPin,
  Phone,
  Star,
  ChevronLeft,
  Globe,
  Clock,
  Mail,
  Navigation,
  ChevronDown,
  Sparkles,
  Flag,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import {
  getFormattedHoursForDay,
  getTodayOpeningHours,
  localizeOpeningHoursText,
  normalizeAvailableHours,
  type NormalizedAvailableHours,
} from "@/utils/availableHours";
import PlaceReportModal from "@/components/PlaceReportModal";
import { ReviewSourceLabel } from "@/components/ReviewSourceLabel";
import { AppDownloadCTA } from "@/components/AppDownloadCTA";
import WritePlaceReviewCTA from "@/components/WritePlaceReviewCTA";
import ReviewAuthorLink from "@/components/ReviewAuthorLink";
import { PetWellVerifiedBadge } from "@/components/PetWellVerifiedBadge";
import { PremiumPartnerBadge } from "@/components/PremiumPartnerBadge";
import PlaceServicesSection from "@/components/PlaceServicesSection";
import { translateServiceOfferings } from "@/utils/serviceOfferings";
import { getGoogleMapsEmbedUrl, getGoogleMapsUrl } from "@/utils/placeMaps";
import { resolvePlaceReviewImageUrl } from "@/services/placeReviewApi";
import PlaceReservationDialog from "@/components/PlaceReservationDialog";
import { BusinessReviewReply } from "@/components/BusinessReviewReply";
import { canShowPartnerBooking } from "@/utils/restaurantReservationAvailability";
import type { RestaurantReservationSettings } from "@/services/restaurantApi";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

type PlaceType = "clinic" | "salon" | "lodging";
type I18nNamespace = "clinics" | "salons" | "lodging";

export type PlaceReview = {
  id: string;
  reviewerId?: string | null;
  reviewer?: {
    id?: string | null;
    displayName?: string | null;
    firstName?: string | null;
    profileImage?: string | null;
  } | null;
  title?: string;
  description?: string;
  totalRating: number;
  fileAttachments?: string[];
  source?: string;
  anonymous?: boolean | null;
  partnerReply?: string | null;
  partnerReplyAt?: string | null;
  updatedAt: string;
};

type CoverImageProps = {
  imageKey: string | undefined;
  alt: string;
  className?: string;
};

export type PlaceDetailLayoutProps = {
  backTo: string;
  name: string;
  address: string;
  district: string;
  coverImageKey?: string;
  gallery?: string[];
  verified?: boolean;
  isPremium?: boolean;
  is247?: boolean;
  totalRating?: number;
  totalReviews: number;
  phoneNo?: string | null;
  email?: string | null;
  website?: string | null;
  availableHours?: unknown;
  serviceOfferings?: string | null;
  reviews: PlaceReview[];
  placeId: string;
  placeType: PlaceType;
  i18nNamespace: I18nNamespace;
  CoverImage: ComponentType<CoverImageProps>;
  location?: { lat: number; lon: number };
  ownerSub?: string | null;
  reservationSettings?: RestaurantReservationSettings | string | null;
};

const PlaceDetailLayout = ({
  backTo,
  name,
  address,
  district,
  coverImageKey,
  gallery,
  verified,
  isPremium,
  is247,
  totalRating,
  totalReviews,
  phoneNo,
  email,
  website,
  availableHours,
  serviceOfferings,
  reviews,
  placeId,
  placeType,
  i18nNamespace,
  CoverImage,
  location,
  ownerSub,
  reservationSettings,
}: PlaceDetailLayoutProps) => {
  const { t, i18n } = useTranslation();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);

  const lang: "zh" | "en" = i18n.language === "en" ? "en" : "zh";
  const ns = i18nNamespace;
  const canBook = canShowPartnerBooking(ownerSub, reservationSettings);
  const reservationPlaceType =
    placeType === "salon" ? "SALON" : placeType === "clinic" ? "CLINIC" : "LODGING";

  const normalizedHours: NormalizedAvailableHours | null = availableHours
    ? normalizeAvailableHours(availableHours)
    : null;
  const displayedReviews = reviews.slice(0, 3);
  const coverImage = coverImageKey || gallery?.[0];
  const todayHours = getTodayOpeningHours(availableHours, is247 ?? false, t);
  const mapsUrl = getGoogleMapsUrl(address, location);
  const mapsEmbedUrl = getGoogleMapsEmbedUrl(address, location);
  const hasGallery = gallery && gallery.length > 1;

  const serviceHighlights = useMemo(
    () => translateServiceOfferings(serviceOfferings, i18n.language).slice(0, 4),
    [i18n.language, serviceOfferings],
  );

  const serviceTiles = useMemo(
    () =>
      serviceHighlights.map((label) => ({
        icon: Sparkles as LucideIcon,
        label,
        accent: "text-primary bg-primary/10",
      })),
    [serviceHighlights],
  );

  return (
    <>
      <main className="flex-1 bg-gradient-hero pb-12">
        <div className="container mx-auto px-4 max-w-5xl pt-6 md:pt-10">
          <nav aria-label="返回導航">
            <AppLink
              href={backTo}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-5 md:mb-6 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>{t(`${ns}.backToList`)}</span>
            </AppLink>
          </nav>

          <article className="space-y-5 md:space-y-6">
            <Card className="overflow-hidden border-0 shadow-soft">
              <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-muted">
                <CoverImage
                  imageKey={coverImage}
                  alt={name}
                  className="h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {isPremium && <PremiumPartnerBadge variant="onDark" />}
                    {verified && <PetWellVerifiedBadge variant="onDark" />}
                    {is247 && (
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {t("hours.open247")}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-2">
                    {name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:text-base">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                      {district}
                    </span>
                    {totalRating && totalRating > 0 && (
                      <span
                        className="inline-flex items-center gap-1.5"
                        aria-label={`${totalRating.toFixed(1)} / 5`}
                      >
                        <Star className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
                        <span className="font-semibold">{totalRating.toFixed(1)}</span>
                        {totalReviews > 0 && (
                          <span className="text-white/80">({totalReviews})</span>
                        )}
                      </span>
                    )}
                    {(todayHours || is247) && (
                      <span className="inline-flex items-center gap-1.5 text-white/90">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        {todayHours || t("hours.open247")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {serviceTiles.length > 0 && (
              <Card className="p-3.5 md:p-4 bg-secondary/60 border-primary/15">
                <header className="mb-2.5">
                  <h2 className="text-sm md:text-base font-bold">
                    {t(`${ns}.detail.servicesOverview`)}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(`${ns}.detail.servicesOverviewSubtitle`)}
                  </p>
                </header>
                <div className="flex flex-wrap gap-2">
                  {serviceTiles.map(({ icon: Icon, label, accent }) => (
                    <div
                      key={label}
                      className="inline-flex items-center gap-2 rounded-lg bg-card px-2.5 py-2 border border-border/60"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${accent}`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                      <span className="font-medium text-xs md:text-sm leading-snug">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
              <div className="order-2 lg:order-1 lg:col-span-2 space-y-5 md:space-y-6">
                <PlaceServicesSection
                  title={t(`${ns}.services`)}
                  services={serviceOfferings}
                />

                {hasGallery && (
                  <Card className="p-5 md:p-6">
                    <h2 className="text-xl font-bold mb-4">{t(`${ns}.gallery`)}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {gallery!.slice(0, 6).map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                        >
                          <img
                            src={image}
                            alt={`${name} - ${index + 1}`}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="p-5 md:p-6">
                  <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">
                        {t(`${ns}.detail.reviewsTitle`)}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t(`${ns}.detail.reviewsSubtitle`)}
                      </p>
                    </div>
                    <WritePlaceReviewCTA
                      placeType={placeType}
                      placeId={placeId}
                      placeName={name}
                    />
                  </header>

                  {displayedReviews.length > 0 ? (
                    <div className="space-y-6">
                      {displayedReviews.map((review) => {
                        const rating = Math.max(
                          0,
                          Math.min(5, Math.round(review.totalRating || 0)),
                        );
                        return (
                          <article
                            key={review.id}
                            className="border-b border-border pb-6 last:border-0 last:pb-0"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="mb-2">
                                  <ReviewAuthorLink
                                    reviewerId={review.reviewerId || review.reviewer?.id}
                                    anonymous={review.anonymous}
                                    source={review.source}
                                    displayName={
                                      review.reviewer?.displayName || review.reviewer?.firstName
                                    }
                                    profileImage={review.reviewer?.profileImage}
                                    avatarClassName="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg"
                                  />
                                </div>
                                <div
                                  className="flex gap-0.5 mb-2"
                                  aria-label={`評分 ${rating} 星`}
                                >
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < rating ? "fill-primary text-primary" : "text-muted"}`}
                                      aria-hidden="true"
                                    />
                                  ))}
                                </div>
                                {review.title ? (
                                  <h3 className="font-bold mb-1.5">{review.title}</h3>
                                ) : null}
                                {review.description ? (
                                  <p className="text-foreground leading-relaxed mb-2">
                                    {review.description}
                                  </p>
                                ) : (
                                  <p className="text-muted-foreground mb-2">
                                    {t(`${ns}.detail.reviewsEmpty`)}
                                  </p>
                                )}
                                {review.fileAttachments &&
                                  review.fileAttachments.length > 0 && (
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                      {review.fileAttachments.map((image, idx) => (
                                        <img
                                          key={idx}
                                          src={resolvePlaceReviewImageUrl(image)}
                                          alt={`評論圖片 ${idx + 1}`}
                                          className="w-20 h-20 object-cover rounded-lg"
                                        />
                                      ))}
                                    </div>
                                  )}
                                <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <time dateTime={review.updatedAt}>
                                    {format(
                                      new Date(review.updatedAt),
                                      lang === "en" ? "MMM d, yyyy" : "yyyy年MM月dd日",
                                    )}
                                  </time>
                                  <ReviewSourceLabel source={review.source} />
                                </p>
                                {review.partnerReply?.trim() ? (
                                  <BusinessReviewReply
                                    reply={review.partnerReply}
                                    repliedAt={review.partnerReplyAt}
                                    placeName={name}
                                    label={t(`${ns}.detail.businessReply`)}
                                    fromLabel={t(`${ns}.detail.businessReplyFrom`)}
                                    officialBadge={t(`${ns}.detail.businessReplyOfficial`)}
                                    lang={lang}
                                  />
                                ) : null}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <WritePlaceReviewCTA
                      placeType={placeType}
                      placeId={placeId}
                      placeName={name}
                      variant="empty"
                    />
                  )}

                  {displayedReviews.length >= 3 && (
                    <aside
                      aria-label={t(`${ns}.detail.reviewsMoreTitle`)}
                      className="mt-6"
                    >
                      <Card className="border-0 bg-gradient-primary p-6 md:p-8">
                        <AppDownloadCTA
                          variant="primary"
                          title={t(`${ns}.detail.reviewsMoreTitle`)}
                          description={t(`${ns}.detail.reviewsMoreDescription`)}
                        />
                      </Card>
                    </aside>
                  )}
                </Card>
              </div>

              <aside className="order-1 lg:order-2 space-y-5 md:space-y-6 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
                <Card className="p-5 md:p-6 space-y-5">
                  {totalRating && totalRating > 0 && (
                    <div className="text-center pb-4 border-b border-border">
                      <div className="text-4xl font-bold text-primary leading-none">
                        {totalRating.toFixed(1)}
                      </div>
                      <div className="flex justify-center gap-0.5 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(totalRating) ? "fill-primary text-primary" : "text-muted"}`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      {totalReviews > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {totalReviews}{" "}
                          {lang === "en" ? "reviews" : t(`${ns}.reviews`)}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-bold mb-4">
                      {t(`${ns}.detail.planVisit`)}
                    </h2>
                    <address className="space-y-4 not-italic text-sm">
                      <div>
                        <div className="flex items-start gap-2.5 mb-3">
                          <MapPin
                            className="w-4 h-4 text-primary shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="font-medium mb-0.5">{t(`${ns}.address`)}</p>
                            <p className="text-muted-foreground leading-relaxed">
                              {address}
                            </p>
                          </div>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-border aspect-[4/3] bg-muted">
                          <iframe
                            title={`${name} — ${t(`${ns}.address`)}`}
                            src={mapsEmbedUrl}
                            className="h-full w-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                          />
                        </div>
                      </div>

                      {phoneNo && (
                        <div className="flex items-center gap-2.5">
                          <Phone
                            className="w-4 h-4 text-primary shrink-0"
                            aria-hidden="true"
                          />
                          <div>
                            <p className="font-medium">{t(`${ns}.phone`)}</p>
                            <a
                              href={`tel:${phoneNo}`}
                              className="text-primary hover:underline"
                            >
                              {phoneNo}
                            </a>
                          </div>
                        </div>
                      )}

                      {email && (
                        <div className="flex items-start gap-2.5">
                          <Mail
                            className="w-4 h-4 text-primary shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="font-medium">{t(`${ns}.detail.email`)}</p>
                            <a
                              href={`mailto:${email}`}
                              className="text-primary hover:underline break-all"
                            >
                              {email}
                            </a>
                          </div>
                        </div>
                      )}

                      {website && (
                        <div className="flex items-start gap-2.5">
                          <Globe
                            className="w-4 h-4 text-primary shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="font-medium">{t(`${ns}.website`)}</p>
                            <a
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all"
                            >
                              {website}
                            </a>
                          </div>
                        </div>
                      )}
                    </address>

                    {(is247 || normalizedHours) && (
                      <div className="pt-4 mt-4 border-t border-border">
                        <h3 className="font-bold flex items-center gap-2 text-sm mb-1">
                          <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                          {t(`${ns}.openingHours`)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium text-foreground">
                            {t(`${ns}.detail.todayHours`)}：
                          </span>{" "}
                          {todayHours ||
                            (is247
                              ? t("hours.open247")
                              : t(`${ns}.detail.noHoursToday`))}
                        </p>

                        {!is247 && normalizedHours && (
                          <Collapsible
                            open={hoursExpanded}
                            onOpenChange={setHoursExpanded}
                          >
                            <CollapsibleTrigger className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
                              {hoursExpanded
                                ? t(`${ns}.detail.hideFullHours`)
                                : t(`${ns}.detail.viewFullHours`)}
                              <ChevronDown
                                className={`w-4 h-4 ml-1 transition-transform ${hoursExpanded ? "rotate-180" : ""}`}
                                aria-hidden="true"
                              />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3">
                              <div className="space-y-1 rounded-lg bg-muted/40 p-3">
                                {DAYS.map((day) => {
                                  const formattedHours = getFormattedHoursForDay(
                                    normalizedHours,
                                    day,
                                  );
                                  return (
                                    <div
                                      key={day}
                                      className="flex justify-between gap-3 py-1 text-sm"
                                    >
                                      <span className="font-medium">
                                        {t(`hours.${day}`)}
                                      </span>
                                      <span className="text-muted-foreground text-right">
                                        {formattedHours || t(`${ns}.closed`)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              {normalizedHours.otherConditions && (
                                <p className="mt-3 text-sm text-muted-foreground">
                                  {localizeOpeningHoursText(
                                    normalizedHours.otherConditions,
                                    i18n.language,
                                  )}
                                </p>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    {canBook && (
                      <Button
                        className="w-full font-semibold"
                        onClick={() => setReservationOpen(true)}
                      >
                        <CalendarCheck className="w-4 h-4 mr-2" />
                        {lang === "en" ? "Book now" : "立即預約"}
                      </Button>
                    )}
                    {phoneNo && (
                      <Button asChild className="w-full font-semibold" variant={canBook ? "outline" : "default"}>
                        <a href={`tel:${phoneNo}`}>
                          <Phone className="w-4 h-4 mr-2" />
                          {t(`${ns}.detail.callNow`)}
                        </a>
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      className="w-full font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        <Navigation className="w-4 h-4 mr-2" />
                        {t(`${ns}.detail.getDirections`)}
                      </a>
                    </Button>
                  </div>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                  {t(`${ns}.detail.suggestEditPrompt`)}{" "}
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    <Flag className="h-3 w-3" aria-hidden />
                    {t(`${ns}.detail.suggestEdit`)}
                  </button>
                </p>

                <Card className="bg-gradient-subtle p-5">
                  <AppDownloadCTA
                    title={t(`${ns}.ctaTitle`)}
                    description={t(`${ns}.ctaDescription`)}
                  />
                </Card>
              </aside>
            </div>
          </article>
        </div>
      </main>

      <PlaceReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        placeId={placeId}
        placeName={name}
        placeType={placeType}
      />
      {canBook && (
        <PlaceReservationDialog
          open={reservationOpen}
          onOpenChange={setReservationOpen}
          placeType={reservationPlaceType}
          placeId={placeId}
          placeName={name}
          reservationSettings={reservationSettings}
        />
      )}
    </>
  );
};

export default PlaceDetailLayout;
