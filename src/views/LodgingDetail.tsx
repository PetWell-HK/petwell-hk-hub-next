"use client";

import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLodging } from "@/hooks/useLodging";
import { useSEO } from "@/hooks/useSEO";
import PlaceDetailLayout from "@/components/PlaceDetailLayout";
import { LodgingImage } from "@/components/LodgingImage";
import { isEffectivePremium } from "@/utils/partnerPremium";

function getLocalizedString(
  multiLang: { zh?: string; en?: string } | undefined,
  lang: "zh" | "en",
) {
  if (!multiLang) return "";
  const fallbackLang = lang === "en" ? "zh" : "en";
  return multiLang[lang]?.trim() || multiLang[fallbackLang]?.trim() || "";
}

const LodgingDetail = () => {
  const { lodgingId } = useParams();
  const { i18n, t } = useTranslation();
  const { data: lodging, isLoading, error } = useLodging(lodgingId);
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

  useSEO({
    title: lodging
      ? `${lodgingName} | 寵物寄養評價、地址 | PetWell HK`
      : "寵物寄養詳情 | PetWell HK",
    description: lodging
      ? `${lodgingName}寵物寄養評價、真實用家評論。地址：${lodgingAddress}。服務：${lodgingServices}。`
      : "查看寵物寄養場所詳細資料、評價及服務",
    keywords: lodging
      ? `${lodgingName}寵物寄養,${lodgingName}評價,${lodging.district}寵物寄養,寵物酒店推薦`
      : "寵物寄養,香港寵物寄養",
    canonicalUrl: `https://petwellhk.com/lodging/${lodgingId}`,
    structuredData,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16 md:py-20 flex items-center justify-center bg-gradient-hero">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !lodging) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16 bg-gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {t("lodging.detail.notFound")}
            </h1>
            <Link to="/lodging">
              <Button>{t("lodging.backToList")}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const reviews = lodging.reviews?.items || [];
  const totalReviews = lodging.numReviews || reviews.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
      <Footer />
    </div>
  );
};

export default LodgingDetail;
