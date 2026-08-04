import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSalon } from "@/hooks/useSalons";
import { useSEO } from "@/hooks/useSEO";
import PlaceDetailLayout from "@/components/PlaceDetailLayout";
import { SalonImage } from "@/components/SalonImage";
import { isEffectivePremium } from "@/utils/partnerPremium";

function getLocalizedString(
  multiLang: { zh?: string; en?: string } | undefined,
  lang: "zh" | "en",
) {
  if (!multiLang) return "";
  const fallbackLang = lang === "en" ? "zh" : "en";
  return multiLang[lang]?.trim() || multiLang[fallbackLang]?.trim() || "";
}

const SalonDetail = () => {
  const { salonId } = useParams();
  const { i18n, t } = useTranslation();
  const { data: salon, isLoading, error } = useSalon(salonId);
  const lang: "zh" | "en" = i18n.language === "en" ? "en" : "zh";

  const salonName = getLocalizedString(salon?.name, lang);
  const salonAddress = getLocalizedString(salon?.address, lang);
  const salonDistrict = salon?.district || "";
  const salonServices =
    salon?.serviceOfferings?.split(",").slice(0, 3).join("、") || "";

  const structuredData = useMemo(() => {
    if (!salon) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: salonName,
      address: {
        "@type": "PostalAddress",
        streetAddress: salonAddress,
        addressLocality: salonDistrict,
        addressRegion: "Hong Kong",
      },
      telephone: salon.phoneNo,
      email: salon.email,
      url: `https://petwellhk.com/salons/${salonId}`,
      ...(salon.totalRating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: salon.totalRating,
          bestRating: 5,
          reviewCount: salon.numReviews || 0,
        },
      }),
      ...(salon.reviews?.items?.length && {
        review: salon.reviews.items.slice(0, 3).map((review) => ({
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
  }, [salon, salonId, salonName, salonAddress, salonDistrict]);

  useSEO({
    title: salon
      ? `${salonName} | 寵物美容評價、地址 | PetWell HK`
      : "寵物美容詳情 | PetWell HK",
    description: salon
      ? `${salonName}寵物美容評價、真實用家評論。地址：${salonAddress}。服務：${salonServices}。`
      : "查看寵物美容店詳細資料、評價及服務",
    keywords: salon
      ? `${salonName}寵物美容,${salonName}評價,${salon.district}寵物美容,寵物美容推薦`
      : "寵物美容,香港寵物美容",
    canonicalUrl: `https://petwellhk.com/salons/${salonId}`,
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

  if (error || !salon) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16 bg-gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {t("salons.detail.notFound")}
            </h1>
            <Link to="/salons">
              <Button>{t("salons.backToList")}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const reviews = salon.reviews?.items || [];
  const totalReviews = salon.numReviews || reviews.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PlaceDetailLayout
        backTo="/salons"
        name={salonName}
        address={salonAddress}
        district={salonDistrict}
        coverImageKey={salon.coverPhoto}
        gallery={salon.gallery}
        verified={salon.verified}
        isPremium={isEffectivePremium(salon)}
        is247={salon.is247}
        totalRating={salon.totalRating}
        totalReviews={totalReviews}
        phoneNo={salon.phoneNo}
        email={salon.email}
        website={salon.website}
        availableHours={salon.availableHours}
        serviceOfferings={salon.serviceOfferings}
        reviews={reviews}
        placeId={salon.id}
        placeType="salon"
        i18nNamespace="salons"
        CoverImage={SalonImage}
        reservationSettings={salon.reservationSettings as never}
        ownerSub={salon.ownerSub}
      />
      <Footer />
    </div>
  );
};

export default SalonDetail;
