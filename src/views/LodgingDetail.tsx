"use client";

import { useParams } from "next/navigation";
import { routeParam } from "@/lib/routeParam";
import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLodging } from "@/hooks/useLodging";
import PlaceDetailLayout from "@/components/PlaceDetailLayout";
import { LodgingImage } from "@/components/LodgingImage";
import { isEffectivePremium } from "@/utils/partnerPremium";
import type { ApiLodging } from "@/services/lodgingApi";

function getLocalizedString(
  multiLang: { zh?: string; en?: string } | undefined,
  lang: "zh" | "en",
) {
  if (!multiLang) return "";
  const fallbackLang = lang === "en" ? "zh" : "en";
  return multiLang[lang]?.trim() || multiLang[fallbackLang]?.trim() || "";
}

const LodgingDetail = ({ initialLodging = null }: { initialLodging?: ApiLodging | null }) => {
  const lodgingId = routeParam(useParams().lodgingId);
  const { i18n, t } = useTranslation();
  const { data: lodging, isLoading, error } = useLodging(lodgingId, initialLodging);
  const lang: "zh" | "en" = i18n.language === "en" ? "en" : "zh";

  const lodgingName = getLocalizedString(lodging?.name, lang);
  const lodgingAddress = getLocalizedString(lodging?.address, lang);
  const lodgingDistrict = lodging?.district || "";
  const lodgingServices =
    lodging?.serviceOfferings?.split(",").slice(0, 3).join("、") || "";

  const structuredData = useMemo(() => {
    if (!lodging) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      name: lodgingName,
      address: {
        "@type": "PostalAddress",
        streetAddress: lodgingAddress,
        addressLocality: lodgingDistrict,
        addressRegion: "Hong Kong",
      },
      telephone: lodging.phoneNo,
      email: lodging.email,
      url: `https://petwellhk.com/lodging/${lodgingId}`,
      ...(lodging.totalRating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: lodging.totalRating,
          bestRating: 5,
          reviewCount: lodging.numReviews || 0,
        },
      }),
      ...(lodging.reviews?.items?.length && {
        review: lodging.reviews.items.slice(0, 3).map((review) => ({
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.totalRating,
            bestRating: 5,
          },
          reviewBody: review.description,
          datePublished: review.updatedAt,
        })),
      }),
    };
  }, [lodging, lodgingId, lodgingName, lodgingAddress, lodgingDistrict]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-16 md:py-20 flex items-center justify-center bg-gradient-hero">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (error || !lodging) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-12 md:py-16 bg-gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {t("lodging.detail.notFound")}
            </h1>
            <AppLink href="/lodging">
              <Button>{t("lodging.backToList")}</Button>
            </AppLink>
          </div>
        </main>
      </div>
    );
  }

  const reviews = lodging.reviews?.items || [];
  const totalReviews = lodging.numReviews || reviews.length;

  return (
    <div className="min-h-screen flex flex-col">
      <PlaceDetailLayout
        backTo="/lodging"
        name={lodgingName}
        address={lodgingAddress}
        district={lodgingDistrict}
        coverImageKey={lodging.coverPhoto}
        gallery={lodging.gallery}
        verified={lodging.verified}
        isPremium={isEffectivePremium(lodging)}
        is247={lodging.is247}
        totalRating={lodging.totalRating}
        totalReviews={totalReviews}
        phoneNo={lodging.phoneNo}
        email={lodging.email}
        website={lodging.website}
        availableHours={lodging.availableHours}
        serviceOfferings={lodging.serviceOfferings}
        reviews={reviews}
        placeId={lodging.id}
        placeType="lodging"
        i18nNamespace="lodging"
        CoverImage={LodgingImage}
        reservationSettings={lodging.reservationSettings as never}
        ownerSub={lodging.ownerSub}
      />
    </div>
  );
};

export default LodgingDetail;
