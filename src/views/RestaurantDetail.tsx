import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Phone,
  Star,
  Loader2,
  Clock,
  DoorOpen,
  CalendarCheck,
  Coffee,
  Navigation,
  ChevronDown,
  PawPrint,
  Flag,
  TriangleAlert,
} from "lucide-react";
import { useRestaurant } from "@/hooks/useRestaurants";
import { isEffectivePremium } from "@/utils/partnerPremium";
import {
  normalizeAvailableHours,
  getFormattedHoursForDay,
  getTodayOpeningHours,
  localizeOpeningHoursText,
} from "@/utils/availableHours";
import { useSEO } from "@/hooks/useSEO";
import PlaceReportModal from "@/components/PlaceReportModal";
import { ReviewSourceLabel } from "@/components/ReviewSourceLabel";
import { AppDownloadCTA } from "@/components/AppDownloadCTA";
import WritePlaceReviewCTA from "@/components/WritePlaceReviewCTA";
import ReviewAuthorLink from "@/components/ReviewAuthorLink";
import { RestaurantImage } from "@/components/RestaurantImage";
import NearbyRestaurants from "@/components/NearbyRestaurants";
import { RestaurantImportInsights } from "@/components/restaurant/RestaurantImportInsights";
import { RestaurantDetailHero } from "@/components/restaurant/RestaurantDetailHero";
import { RestaurantDetailSectionNav } from "@/components/restaurant/RestaurantDetailSectionNav";
import { RestaurantDetailIdentity } from "@/components/restaurant/RestaurantDetailIdentity";
import RestaurantReservationDialog from "@/components/restaurant/RestaurantReservationDialog";
import { BusinessReviewReply } from "@/components/BusinessReviewReply";
import {
  getRestaurantWebsiteUrl,
  parseRestaurantExternalMetadata,
} from "@/utils/restaurantExternalMetadata";
import { getRestaurantCombinedRating } from "@/utils/restaurantRating";
import { getGoogleMapsEmbedUrl, getGoogleMapsUrl } from "@/utils/placeMaps";
import { canShowPartnerBooking } from "@/utils/restaurantReservationAvailability";
import type { ApiRestaurant } from "@/services/restaurantApi";
import { resolvePlaceReviewImageUrl } from "@/services/placeReviewApi";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

type PetEntryPolicy = ApiRestaurant["petEntryPolicy"];
type PetAccessArea = ApiRestaurant["petAccessArea"];

function getLocalizedString(
  multiLang: { zh?: string; en?: string } | undefined,
  lang: "zh" | "en",
) {
  if (!multiLang) return "";
  const fallbackLang = lang === "en" ? "zh" : "en";
  return multiLang[lang] || multiLang[fallbackLang] || "";
}

const RestaurantDetail = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { t, i18n } = useTranslation();
  const { data: restaurant, isLoading, error } = useRestaurant(
    restaurantId,
    i18n.language,
  );
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [reservationOpen, setReservationOpen] = useState(false);
  const canBook = canShowPartnerBooking(
    restaurant?.ownerSub,
    restaurant?.reservationSettings,
  );

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const img = target.closest("img") as HTMLImageElement | null;
    if (!img) return;
    if (img.closest("a")) return;
    // Ignore tiny icons/avatars
    if (img.naturalWidth && img.naturalWidth < 80) return;
    const src = img.currentSrc || img.getAttribute("src");
    if (!src) return;
    e.preventDefault();
    setLightboxSrc(src);
    setLightboxAlt(img.getAttribute("alt") || "");
    setLightboxOpen(true);
  }, []);

  const lang: "zh" | "en" = i18n.language === "en" ? "en" : "zh";

  const restaurantName = getLocalizedString(restaurant?.name, lang);
  const restaurantAddress = getLocalizedString(restaurant?.address, lang);
  const restaurantDistrict = restaurant?.district || "";

  const detailFaq = useMemo(() => {
    if (!restaurant) return [];
    const indoor = restaurant.petAccessArea === "INDOOR_ALLOWED";
    return [
      {
        question: t("restaurants.detail.faq.q1", { name: restaurantName }),
        answer: t("restaurants.detail.faq.a1", {
          name: restaurantName,
          policy: indoor
            ? t("restaurant.petAccessArea.indoorAllowed")
            : t("restaurant.petAccessArea.outdoorOnly"),
        }),
      },
      {
        question: t("restaurants.detail.faq.q2", { name: restaurantName }),
        answer: t("restaurants.detail.faq.a2"),
      },
      {
        question: t("restaurants.detail.faq.q3", { name: restaurantName }),
        answer: t("restaurants.detail.faq.a3"),
      },
    ];
  }, [restaurant, restaurantName, t]);

  const structuredData = useMemo(() => {
    if (!restaurant) return undefined;
    const canonicalUrl = `https://petwellhk.com/restaurants/${restaurantId}`;
    const amenityFeatures: string[] = [];
    if (restaurant.petAccessArea === "INDOOR_ALLOWED") amenityFeatures.push("Indoor pet access");
    if (restaurant.puppuccino) amenityFeatures.push("Puppuccino");

    const combinedRating = getRestaurantCombinedRating({
      totalRating: restaurant.totalRating,
      externalMetadata: restaurant.externalMetadata,
      combinedRating: restaurant.combinedRating,
    });

    return [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PetWell HK", item: "https://petwellhk.com/" },
          {
            "@type": "ListItem",
            position: 2,
            name: t("restaurants.pageTitle"),
            item: "https://petwellhk.com/restaurants",
          },
          { "@type": "ListItem", position: 3, name: restaurantName, item: canonicalUrl },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: restaurantName,
        address: {
          "@type": "PostalAddress",
          streetAddress: restaurantAddress,
          addressLocality: restaurantDistrict,
          addressRegion: "Hong Kong",
        },
        telephone: restaurant.phoneNo,
        url: canonicalUrl,
        servesCuisine: "Pet Friendly Dining",
        ...(amenityFeatures.length > 0 && {
          amenityFeature: amenityFeatures.map((name) => ({
            "@type": "LocationFeatureSpecification",
            name,
            value: true,
          })),
        }),
        ...(combinedRating != null && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: combinedRating,
            bestRating: 5,
          },
        }),
        ...(restaurant.coverPhoto && {
          image: restaurant.coverPhoto,
        }),
        ...(restaurant.location?.lat &&
          restaurant.location?.lon && {
            geo: {
              "@type": "GeoCoordinates",
              latitude: restaurant.location.lat,
              longitude: restaurant.location.lon,
            },
          }),
      },
    ];
  }, [restaurant, restaurantId, restaurantName, restaurantAddress, restaurantDistrict, t]);

  useSEO({
    title: restaurant
      ? `${restaurantName} | ${restaurantDistrict}寵物友善餐廳 | PetWell HK`
      : "寵物友善餐廳詳情 | PetWell HK",
    description: restaurant
      ? `${restaurantName}係${restaurantDistrict}寵物友善餐廳，經PetWell認證。${restaurant.petAccessArea === "INDOOR_ALLOWED" ? "可帶狗入室內" : "戶外用餐區"}。地址：${restaurantAddress}。`
      : "查看寵物友善餐廳詳細資料及寵物政策",
    keywords: restaurant
      ? `${restaurantName}寵物友善,${restaurantDistrict}帶狗餐廳,${restaurantName}帶狗,寵物友善餐廳推薦`
      : "寵物友善餐廳,帶狗餐廳",
    canonicalUrl: `https://petwellhk.com/restaurants/${restaurantId}`,
    ogImage: restaurant?.coverPhoto,
    structuredData,
    faqItems: detailFaq,
  });

  const getPetEntryPolicyLabel = (policy?: PetEntryPolicy) => {
    switch (policy) {
      case "WALK_IN_ONLY":
        return t("restaurant.petEntryPolicy.walkInOnly");
      case "RESERVATION_REQUIRED":
        return t("restaurant.petEntryPolicy.reservationRequired");
      case "BOTH":
        return t("restaurant.petEntryPolicy.both");
      case "UNKNOWN":
      case undefined:
        return null;
      default: {
        const _exhaustive: never = policy;
        return _exhaustive;
      }
    }
  };

  const getPetAccessAreaLabel = (area?: PetAccessArea) => {
    switch (area) {
      case "INDOOR_ALLOWED":
        return t("restaurant.petAccessArea.indoorAllowed");
      case "OUTDOOR_ONLY":
        return t("restaurant.petAccessArea.outdoorOnly");
      case "UNKNOWN":
      case undefined:
        return null;
      default: {
        const _exhaustive: never = area;
        return _exhaustive;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="restaurant-page min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16 md:py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="restaurant-page min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {t("restaurants.detail.notFound")}
            </h1>
            <Link to="/restaurants">
              <Button>{t("restaurants.backToList")}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const normalizedHours = restaurant.availableHours
    ? normalizeAvailableHours(restaurant.availableHours)
    : null;
  const displayedReviews = (restaurant.reviews?.items || []).slice(0, 5);
  const totalReviews = restaurant.reviews?.items?.length || 0;
  const coverImageKey = restaurant.coverPhoto || restaurant.gallery?.[0];
  const petAccessLabel = getPetAccessAreaLabel(restaurant.petAccessArea);
  const petEntryLabel = getPetEntryPolicyLabel(restaurant.petEntryPolicy);
  const petPolicyNotes = getLocalizedString(restaurant.petPolicyNotes, lang);
  const listingAlert = getLocalizedString(restaurant.listingAlert, lang);
  const todayHours = getTodayOpeningHours(
    restaurant.availableHours,
    restaurant.is247,
    t,
  );
  const mapsUrl = getGoogleMapsUrl(restaurantAddress, restaurant.location);
  const mapsEmbedUrl = getGoogleMapsEmbedUrl(restaurantAddress, restaurant.location);
  const galleryImages = restaurant.gallery ?? [];
  const heroUsesMosaic = galleryImages.length >= 3;
  const overviewGalleryImages = heroUsesMosaic ? galleryImages.slice(5) : galleryImages.slice(1);
  const showOverviewGallery = overviewGalleryImages.length > 0;
  const importMetadata = parseRestaurantExternalMetadata(restaurant.externalMetadata);
  const displayCombinedRating = getRestaurantCombinedRating({
    totalRating: restaurant.totalRating,
    externalMetadata: restaurant.externalMetadata,
    combinedRating: restaurant.combinedRating,
  });

  const policyItems = [
    petAccessLabel
      ? { icon: DoorOpen, label: petAccessLabel, tone: "bg-emerald-50 text-emerald-800 border-emerald-200" }
      : null,
    petEntryLabel
      ? { icon: CalendarCheck, label: petEntryLabel, tone: "bg-sky-50 text-sky-800 border-sky-200" }
      : null,
    restaurant.puppuccino
      ? { icon: Coffee, label: "Puppuccino", tone: "bg-lime-50 text-lime-800 border-lime-200" }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof DoorOpen;
    label: string;
    tone: string;
  }>;

  const hasPetSection = policyItems.length > 0 || Boolean(petPolicyNotes);

  const sectionNav = [
    { id: "overview" as const, label: t("restaurants.detail.sections.overview") },
    { id: "reviews" as const, label: t("restaurants.detail.sections.reviews") },
    { id: "info" as const, label: t("restaurants.detail.sections.info") },
  ];

  const reviewsLabel = lang === "en" ? "reviews" : "則評論";

  const identityProps = {
    name: restaurantName,
    district: restaurantDistrict,
    todayHours,
    is247: restaurant.is247,
    verified: restaurant.verified,
    isPremium: isEffectivePremium(restaurant),
    fehdLicensed: restaurant.fehdLicensed,
    listingAlert: restaurant.listingAlert,
    totalRating: displayCombinedRating ?? undefined,
    totalReviews,
    importMetadata,
    phoneNo: restaurant.phoneNo,
    website: getRestaurantWebsiteUrl(restaurant.website),
    mapsUrl,
    callLabel: t("restaurants.detail.callNow"),
    directionsLabel: t("restaurants.detail.getDirections"),
    websiteLabel: t("restaurants.detail.visitWebsite"),
    open247Label: t("hours.open247"),
    reviewsLabel,
    placeId: restaurant.id,
    placeName: restaurantName,
  };

  return (
    <div className="restaurant-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1" onClick={handleImageClick}>
        {/* Mobile hero — full bleed */}
        <div className="lg:hidden">
          <RestaurantDetailHero
            backLabel={t("restaurants.backToList")}
            coverImageKey={coverImageKey}
            gallery={restaurant.gallery}
            name={restaurantName}
          />
        </div>

        <div className="restaurant-shell">
          {/* Desktop breadcrumb */}
          <nav className="restaurant-breadcrumb hidden lg:flex lg:pt-6" aria-label="Breadcrumb">
            <Link to="/" className="transition-colors hover:text-primary">
              PetWell HK
            </Link>
            <span className="restaurant-breadcrumb-sep" aria-hidden>
              /
            </span>
            <Link to="/restaurants" className="transition-colors hover:text-primary">
              {t("restaurants.pageTitle")}
            </Link>
            <span className="restaurant-breadcrumb-sep" aria-hidden>
              /
            </span>
            <span className="truncate font-medium text-foreground">{restaurantName}</span>
          </nav>

          {/* Desktop split header */}
          <div className="restaurant-desktop-header">
            <RestaurantDetailHero
              backLabel={t("restaurants.backToList")}
              coverImageKey={coverImageKey}
              gallery={restaurant.gallery}
              name={restaurantName}
              layout="desktop"
            />
            <section className="restaurant-panel restaurant-identity-desktop">
              <RestaurantDetailIdentity {...identityProps} layout="desktop" />
            </section>
          </div>

          {/* Mobile identity panel */}
          <section className="restaurant-panel relative z-10 -mt-5 p-4 lg:hidden md:-mt-6 md:p-6">
            <RestaurantDetailIdentity {...identityProps} layout="mobile" />
          </section>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {lang === "zh" ? "這是你的餐廳？" : "Is this your restaurant? "}
            <a
              href="https://partner.petwellhk.com/select-type"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {lang === "zh" ? "前往 PetWell 商戶平台管理餐廳專頁。" : "Manage your listing on PetWell Partner."}
            </a>
          </p>

          <div className="restaurant-content-grid lg:mt-6">
            <div className="min-w-0 lg:flex lg:flex-col">
              <RestaurantDetailSectionNav
                sections={sectionNav}
                className="restaurant-section-nav--desktop"
              />
              <div className="restaurant-main-column mt-4 space-y-6 lg:mt-0 lg:space-y-8">
              {/* Overview + pet policy */}
              <section
                id="overview"
                className="scroll-mt-36 max-lg:restaurant-panel max-lg:p-4 max-lg:md:p-6 lg:scroll-mt-28"
              >
                <RestaurantImportInsights
                  metadata={importMetadata}
                  variant="inline"
                  omitQuickFacts
                />

                {listingAlert && (
                  <div
                    role="alert"
                    className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 md:p-5"
                  >
                    <div className="mb-2 flex items-center gap-2 text-red-800">
                      <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden />
                      <h2 className="text-base font-bold md:text-lg">
                        {t("restaurant.notPetFriendly")}
                      </h2>
                    </div>
                    <p className="text-sm leading-relaxed text-red-900/90 md:text-[15px]">
                      {listingAlert}
                    </p>
                  </div>
                )}

                {hasPetSection && (
                  <div className="restaurant-pet-banner mt-6 rounded-xl p-4 md:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <PawPrint className="h-4 w-4" aria-hidden />
                      </span>
                      <div>
                        <h2 className="text-base font-bold md:text-lg">
                          {t("restaurants.detail.decisionTitle")}
                        </h2>
                        <p className="text-xs text-muted-foreground md:text-sm">
                          {t("restaurants.detail.decisionSubtitle")}
                        </p>
                      </div>
                    </div>

                    {policyItems.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {policyItems.map(({ icon: Icon, label, tone }) => (
                          <span
                            key={label}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${tone}`}
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden />
                            {label}
                          </span>
                        ))}
                      </div>
                    )}

                    {petPolicyNotes && (
                      <p className="mt-3 rounded-lg border border-emerald-100 bg-white/60 px-3 py-2.5 text-sm leading-relaxed text-foreground/80">
                        {petPolicyNotes}
                      </p>
                    )}
                  </div>
                )}

                {showOverviewGallery && (
                  <div className="mt-6 border-t border-border pt-6">
                    <h3 className="mb-3 text-sm font-bold lg:text-base">{t("restaurants.gallery")}</h3>
                    <div className="restaurant-gallery-grid">
                      {overviewGalleryImages.map((image, index) => (
                        <div
                          key={image}
                          className="restaurant-gallery-tile aspect-square rounded-md"
                        >
                          <RestaurantImage
                            imageKey={image}
                            alt={`${restaurantName} - ${index + 1}`}
                            className="h-full w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Reviews */}
              <section
                id="reviews"
                className="scroll-mt-36 max-lg:restaurant-panel max-lg:p-4 max-lg:md:p-6 lg:scroll-mt-28"
              >
                <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold md:text-lg lg:text-xl">
                      {t("restaurants.detail.reviewsTitle")}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground lg:text-sm">
                      {t("restaurants.detail.reviewsSubtitle")}
                    </p>
                  </div>
                  <WritePlaceReviewCTA
                    placeType="restaurant"
                    placeId={restaurant.id}
                    placeName={restaurantName}
                  />
                </header>

                {displayedReviews.length > 0 ? (
                  <div className="restaurant-review-list">
                    {displayedReviews.map((review) => {
                      const rating = Math.max(
                        0,
                        Math.min(5, Math.round(review.totalRating || 0)),
                      );
                      return (
                        <article key={review.id} className="restaurant-review-card">
                          <div className="flex gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1.5">
                                <ReviewAuthorLink
                                  reviewerId={review.reviewerId || review.reviewer?.id}
                                  anonymous={review.anonymous}
                                  source={review.source}
                                  displayName={
                                    review.reviewer?.displayName || review.reviewer?.firstName
                                  }
                                  profileImage={review.reviewer?.profileImage}
                                />
                              </div>
                              <div
                                className="flex gap-0.5 mb-1.5"
                                aria-label={`Rating ${rating} stars`}
                              >
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${i < rating ? "fill-primary text-primary" : "text-muted"}`}
                                    aria-hidden
                                  />
                                ))}
                              </div>
                              {review.title && (
                                <h3 className="font-semibold text-sm mb-1">{review.title}</h3>
                              )}
                              {review.description ? (
                                <p className="text-sm leading-relaxed text-foreground/90">
                                  {review.description}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  {t("restaurants.detail.reviewsEmpty")}
                                </p>
                              )}
                              {review.fileAttachments && review.fileAttachments.length > 0 && (
                                <div className="mt-2 flex gap-1.5 flex-wrap">
                                  {review.fileAttachments.map((image, idx) => (
                                    <img
                                      key={idx}
                                      src={resolvePlaceReviewImageUrl(image)}
                                      alt={`Review photo ${idx + 1}`}
                                      className="h-16 w-16 rounded-md object-cover lg:h-20 lg:w-20"
                                    />
                                  ))}
                                </div>
                              )}
                              <p className="mt-2 text-xs text-muted-foreground flex flex-wrap items-center gap-x-2">
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
                                  placeName={restaurantName}
                                  label={t("restaurants.detail.businessReply")}
                                  fromLabel={t("restaurants.detail.businessReplyFrom")}
                                  officialBadge={t("restaurants.detail.businessReplyOfficial")}
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
                    placeType="restaurant"
                    placeId={restaurant.id}
                    placeName={restaurantName}
                    variant="empty"
                  />
                )}

                {displayedReviews.length >= 3 && (
                  <div className="mt-4 rounded-lg bg-secondary/60 p-4">
                    <AppDownloadCTA
                      title={lang === "en" ? "Want more reviews?" : "想睇更多評論？"}
                      description={
                        lang === "en"
                          ? "Download PetWell to read all reviews"
                          : "下載 PetWell App 睇曬全部評論"
                      }
                    />
                  </div>
                )}
              </section>
              </div>
            </div>

            <aside id="info" className="restaurant-sidebar-desktop scroll-mt-36">
              <div className="restaurant-panel space-y-4 p-4 md:p-5 lg:p-6">
                <h2 className="text-base font-bold lg:text-lg">{t("restaurants.detail.planVisit")}</h2>

                {canBook && (
                  <Button
                    type="button"
                    className="w-full gap-2"
                    onClick={() => setReservationOpen(true)}
                  >
                    <CalendarCheck className="h-4 w-4" aria-hidden />
                    {t("restaurantReservation.cta")}
                  </Button>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t("restaurants.address")}
                  </p>
                  <p className="text-sm leading-relaxed">{restaurantAddress}</p>
                </div>

                <div className="overflow-hidden rounded-lg border bg-muted lg:aspect-[16/11] aspect-[4/3]">
                  <iframe
                    title={`${restaurantName} — ${t("restaurants.address")}`}
                    src={mapsEmbedUrl}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>

                {restaurant.phoneNo && (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="font-medium">{t("restaurants.phone")}</span>
                    </div>
                    <a
                      href={`tel:${restaurant.phoneNo}`}
                      className="shrink-0 font-semibold text-primary hover:underline"
                    >
                      {restaurant.phoneNo}
                    </a>
                  </div>
                )}

                {(restaurant.is247 || normalizedHours) && (
                  <div className="border-t border-border pt-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" aria-hidden />
                      <span className="text-sm font-bold">{t("restaurants.openingHours")}</span>
                    </div>
                    <p className="mb-2 text-sm">
                      <span className="font-medium">{t("restaurants.detail.todayHours")}：</span>
                      <span className="text-muted-foreground">
                        {todayHours ||
                          (restaurant.is247
                            ? t("hours.open247")
                            : t("restaurants.detail.noHoursToday"))}
                      </span>
                    </p>

                    {!restaurant.is247 && normalizedHours && (
                      <>
                        <div className="restaurant-hours-desktop">
                          <div className="space-y-1 rounded-lg bg-muted/50 p-3">
                            {DAYS.map((day) => {
                              const formattedHours = getFormattedHoursForDay(normalizedHours, day);
                              return (
                                <div key={day} className="flex justify-between gap-3 py-0.5 text-sm">
                                  <span className="font-medium">{t(`hours.${day}`)}</span>
                                  <span className="text-right text-muted-foreground">
                                    {formattedHours || t("restaurants.closed")}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {normalizedHours.otherConditions && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {localizeOpeningHoursText(
                                normalizedHours.otherConditions,
                                i18n.language,
                              )}
                            </p>
                          )}
                        </div>

                        <div className="restaurant-hours-mobile">
                          <Collapsible open={hoursExpanded} onOpenChange={setHoursExpanded}>
                            <CollapsibleTrigger className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80">
                              {hoursExpanded
                                ? t("restaurants.detail.hideFullHours")
                                : t("restaurants.detail.viewFullHours")}
                              <ChevronDown
                                className={`ml-1 h-4 w-4 transition-transform ${hoursExpanded ? "rotate-180" : ""}`}
                                aria-hidden
                              />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2">
                              <div className="space-y-1 rounded-lg bg-muted/50 p-3">
                                {DAYS.map((day) => {
                                  const formattedHours = getFormattedHoursForDay(normalizedHours, day);
                                  return (
                                    <div key={day} className="flex justify-between gap-3 py-0.5 text-sm">
                                      <span className="font-medium">{t(`hours.${day}`)}</span>
                                      <span className="text-right text-muted-foreground">
                                        {formattedHours || t("restaurants.closed")}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              {normalizedHours.otherConditions && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  {localizeOpeningHoursText(
                                    normalizedHours.otherConditions,
                                    i18n.language,
                                  )}
                                </p>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-muted-foreground px-2">
                {t("restaurants.detail.suggestEditPrompt")}{" "}
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  <Flag className="h-3 w-3" aria-hidden />
                  {t("restaurants.detail.suggestEdit")}
                </button>
              </p>

              <div className="restaurant-panel p-4 hidden lg:block">
                <AppDownloadCTA
                  title={t("restaurants.ctaTitle")}
                  description={t("restaurants.ctaDescription")}
                />
              </div>
            </aside>
          </div>

          {restaurant.location?.lat && restaurant.location?.lon ? (
            <section className="mt-8 pb-6">
              <NearbyRestaurants
                eventLat={restaurant.location.lat}
                eventLon={restaurant.location.lon}
                language={i18n.language}
                radiusKm={3}
                excludeRestaurantId={restaurant.id}
                variant="detail"
                title={t("restaurants.detail.nearbyTitle")}
                subtitle={t("restaurants.detail.nearbySubtitle", { district: restaurantDistrict })}
              />
            </section>
          ) : null}
        </div>
      </main>

      {/* Mobile sticky action bar */}
      <div className="restaurant-mobile-bar md:hidden" role="toolbar" aria-label="Quick actions">
        {canBook && (
          <button
            type="button"
            onClick={() => setReservationOpen(true)}
            className="restaurant-action-btn restaurant-action-btn--primary"
          >
            <CalendarCheck className="h-4 w-4" />
            {t("restaurantReservation.ctaShort")}
          </button>
        )}
        {restaurant.phoneNo && (
          <a href={`tel:${restaurant.phoneNo}`} className="restaurant-action-btn">
            <Phone className="h-4 w-4" />
            {t("restaurants.detail.callNow")}
          </a>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="restaurant-action-btn"
        >
          <Navigation className="h-4 w-4 text-primary" />
          {t("restaurants.detail.getDirections")}
        </a>
      </div>

      <Footer />

      {canBook && (
        <RestaurantReservationDialog
          open={reservationOpen}
          onOpenChange={setReservationOpen}
          restaurantId={restaurant.id}
          restaurantName={restaurantName}
          reservationSettings={restaurant.reservationSettings}
        />
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[min(92vw,56rem)] border-none bg-black/95 p-2 sm:p-4">
          <DialogTitle className="sr-only">{lightboxAlt || "Zoom image"}</DialogTitle>
          {lightboxSrc && (
            <div className="flex items-center justify-center">
              <img
                src={lightboxSrc}
                alt={lightboxAlt}
                className="max-h-[85vh] w-full rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>


      <PlaceReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        placeId={restaurant.id}
        placeName={restaurantName}
        placeType="restaurant"
      />
    </div>
  );
};

export default RestaurantDetail;
