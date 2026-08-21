"use client";

import { useParams } from "next/navigation";
import { routeParam } from "@/lib/routeParam";
import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useClinic } from "@/hooks/useClinics";
import PlaceDetailLayout from "@/components/PlaceDetailLayout";
import { ClinicImage } from "@/components/ClinicImage";
import { isEffectivePremium } from "@/utils/partnerPremium";
import type { ApiClinic } from "@/services/clinicApi";

function getLocalizedString(
  multiLang: { zh?: string | null; en?: string | null } | undefined | null,
  lang: "zh" | "en",
) {
  if (!multiLang) return "";
  const fallbackLang = lang === "en" ? "zh" : "en";
  return (
    multiLang[lang]?.trim() ||
    multiLang[fallbackLang]?.trim() ||
    ""
  );
}

const ClinicDetail = ({ initialClinic = null }: { initialClinic?: ApiClinic | null }) => {
  const clinicId = routeParam(useParams().clinicId);
  const { i18n, t } = useTranslation();
  const { data: clinic, isLoading, error } = useClinic(clinicId, initialClinic);
  const lang: "zh" | "en" = i18n.language === "en" ? "en" : "zh";

  const clinicName = getLocalizedString(clinic?.name, lang);
  const clinicAddress = getLocalizedString(clinic?.address, lang);
  const clinicDistrict = clinic?.district || "";
  const clinicServices =
    clinic?.serviceOfferings?.split(",").slice(0, 3).join("、") || "";

  const structuredData = useMemo(() => {
    if (!clinic) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "VeterinaryCare",
      name: clinicName,
      address: {
        "@type": "PostalAddress",
        streetAddress: clinicAddress,
        addressLocality: clinicDistrict,
        addressRegion: "Hong Kong",
      },
      telephone: clinic.phoneNo,
      email: clinic.email,
      url: `https://petwellhk.com/clinics/${clinicId}`,
      ...(clinic.totalRating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: clinic.totalRating,
          bestRating: 5,
          reviewCount: clinic.numReviews || 0,
        },
      }),
      ...(clinic.reviews?.items?.length && {
        review: clinic.reviews.items.slice(0, 3).map((review) => ({
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
  }, [clinic, clinicId, clinicName, clinicAddress, clinicDistrict]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-16 md:py-20 flex items-center justify-center bg-gradient-hero">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 py-12 md:py-16 bg-gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {t("clinics.detail.notFound")}
            </h1>
            <AppLink href="/clinics">
              <Button>{t("clinics.backToList")}</Button>
            </AppLink>
          </div>
        </main>
      </div>
    );
  }

  const reviews = clinic.reviews?.items || [];
  const totalReviews = clinic.numReviews || reviews.length;

  return (
    <div className="min-h-screen flex flex-col">
      <PlaceDetailLayout
        backTo="/clinics"
        name={clinicName}
        address={clinicAddress}
        district={clinicDistrict}
        coverImageKey={clinic.coverPhoto}
        gallery={clinic.gallery}
        verified={clinic.verified}
        isPremium={isEffectivePremium(clinic)}
        is247={clinic.is247}
        totalRating={clinic.totalRating}
        totalReviews={totalReviews}
        phoneNo={clinic.phoneNo}
        email={clinic.email}
        website={clinic.website}
        availableHours={clinic.availableHours}
        serviceOfferings={clinic.serviceOfferings}
        reviews={reviews}
        placeId={clinic.id}
        placeType="clinic"
        i18nNamespace="clinics"
        CoverImage={ClinicImage}
        reservationSettings={clinic.reservationSettings as never}
        ownerSub={clinic.ownerSub}
      />
    </div>
  );
};

export default ClinicDetail;
