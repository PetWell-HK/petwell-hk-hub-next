"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PlaceListingLayout from "@/components/PlaceListingLayout";
import { ListInfiniteLoader } from "@/components/ListInfiniteLoader";
import { PlaceListCard } from "@/components/PlaceListCard";
import { useFilteredClinics } from "@/hooks/useClinics";
import { useSearchQueryFromUrl } from "@/hooks/useSearchQueryFromUrl";
import { translateServiceOfferings } from "@/utils/serviceOfferings";
import { getTodayOpeningHours } from "@/utils/availableHours";
import type { Clinic } from "@/services/clinicApi";

const clinicsFAQ = [
  {
    question: "獸醫診所邊間好？點樣揀獸醫？",
    answer:
      "揀獸醫診所可以參考PetWell上嘅真實用戶評價、診所服務範圍、收費透明度。建議選擇評分4分以上、有良好口碑、提供你需要嘅專科服務（如骨科、眼科、皮膚科）嘅診所。",
  },
  {
    question: "香港邊度有24小時獸醫急症服務？",
    answer:
      "香港有多間24小時急症獸醫診所，分佈喺港島、九龍、新界。你可以喺PetWell App篩選「24小時急症」，即時查看附近嘅急症獸醫診所地址同電話。",
  },
  {
    question: "獸醫診所收費大概幾多？",
    answer:
      "獸醫收費視乎服務類型而定。一般檢查約$300-600，疫苗約$200-400，絕育手術約$1,500-4,000不等。PetWell提供各診所收費參考，幫你比較價錢。",
  },
  {
    question: "幾時需要帶寵物睇獸醫？",
    answer:
      "如果寵物出現食慾不振、嘔吐腹瀉、呼吸困難、行動異常、發燒等症狀，應盡快睇獸醫。定期檢查（每年1-2次）同疫苗接種都好重要。",
  },
];

const Clinics = ({
  initialListing = null,
}: {
  initialListing?: { clinics: Clinic[]; total: number; nextToken: number[] | null } | null;
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useSearchQueryFromUrl();
  const [show24HourOnly, setShow24HourOnly] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const {
    clinics: filteredClinics,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFilteredClinics(
    {
      region: selectedRegion,
      keyword: searchQuery,
      is247: show24HourOnly || undefined,
    },
    i18n.language,
    initialListing,
  );

  const regions = [
    { value: "all", label: t("clinics.regions.all") },
    { value: "Kowloon", label: t("clinics.regions.kowloon") },
    { value: "Hong Kong", label: t("clinics.regions.hongKong") },
    { value: "New Territories", label: t("clinics.regions.newTerritories") },
    { value: "Others", label: t("clinics.regions.others") },
  ];

  const activeFilterLabels = [
    ...(selectedRegion !== "all"
      ? [regions.find((region) => region.value === selectedRegion)?.label ?? ""]
      : []),
    ...(show24HourOnly ? [t("clinics.filter24Hour")] : []),
    ...(searchQuery.trim() ? [`"${searchQuery.trim()}"`] : []),
  ].filter(Boolean);

  const hasActiveFilters = activeFilterLabels.length > 0;

  const clearFilters = () => {
    setSelectedRegion("all");
    setSearchQuery("");
    setShow24HourOnly(false);
  };

  const canonicalUrl = "https://petwellhk.com/clinics";
  const seoDescription =
    "寵物香港首選 - 比較全港200+間獸醫診所評價、收費、服務。搵24小時急症獸醫、寵物手術、疫苗接種、絕育服務。九龍、港島、新界全覆蓋，幫寵物香港主人搵到最適合毛孩嘅獸醫診所。";

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PetWell HK", item: "https://petwellhk.com/" },
          { "@type": "ListItem", position: 2, name: t("clinics.pageTitle"), item: canonicalUrl },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "香港獸醫診所列表",
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: filteredClinics.length,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "香港獸醫診所列表",
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: filteredClinics.length,
        itemListElement: filteredClinics.slice(0, 50).map((clinic, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "VeterinaryCare",
            name: clinic.name,
            url: `https://petwellhk.com/clinics/${clinic.id}`,
            address: clinic.address,
            telephone: clinic.phone,
            ...(clinic.rating && {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: clinic.rating,
                bestRating: 5,
                reviewCount: clinic.totalReviews,
              },
            }),
          },
        })),
      },
    ],
    [filteredClinics, t, seoDescription],
  );


  const getDisplayServices = (services: string[]) =>
    translateServiceOfferings(services, i18n.language);
  const getOpeningHoursText = (availableHours: unknown, is247?: boolean) =>
    getTodayOpeningHours(availableHours, is247, t);

  return (
    <PlaceListingLayout
      title={t("clinics.pageTitle")}
      subtitle={t("clinics.subtitle")}
      description={t("clinics.description")}
      trustBadge={t("clinics.trustBadge")}
      searchPlaceholder={t("clinics.searchPlaceholder")}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterByRegionLabel={t("clinics.filterByRegion")}
      filtersLabel={t("clinics.filtersLabel")}
      regions={regions}
      selectedRegion={selectedRegion}
      onRegionChange={setSelectedRegion}
      policyFilters={[
        {
          id: "24hour",
          label: t("clinics.filter24Hour"),
          active: show24HourOnly,
          onToggle: () => setShow24HourOnly((value) => !value),
        },
      ]}
      activeFilterLabels={activeFilterLabels}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={clearFilters}
      clearFiltersLabel={t("clinics.clearFilters")}
      isLoading={isLoading}
      error={error}
      errorTitle={t("clinics.error")}
      errorSubtitle={t("clinics.errorSubtitle")}
      resultCount={filteredClinics.length}
      hasMoreToLoad={hasNextPage}
      resultsCountLabel={t("clinics.resultsCount", { count: filteredClinics.length })}
      noResults={t("clinics.noResults")}
      noResultsHint={t("clinics.noResultsHint")}
      suggestPlaceCategory="clinic"
      listAriaLabel="獸醫診所列表"
      listFooterContent={
        <ListInfiniteLoader
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          loadMoreLabel={t("clinics.loadMore")}
          loadingLabel={t("clinics.loading")}
        />
      }
      ctaTitle={t("clinics.ctaTitle")}
      ctaDescription={t("clinics.ctaDescription")}
      directQuestion="香港有幾多間獸醫診所？點樣搵到好獸醫？"
      directAnswer="香港有超過200間獸醫診所，分佈喺港島、九龍、新界各區。你可以喺PetWell瀏覽真實用戶評價、收費參考、服務比較，搵到最適合毛孩嘅獸醫診所。"
      faqItems={clinicsFAQ}
      faqTitle="獸醫診所常見問題"
    >
      <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {filteredClinics.map((clinic) => (
          <PlaceListCard
            key={clinic.id}
            name={clinic.name}
            district={clinic.district}
            address={clinic.address}
            rating={clinic.rating}
            image={clinic.image}
            verified={clinic.verified}
            isPremium={clinic.isPremium}
            detailPath={`/clinics/${clinic.id}`}
            serviceLabels={getDisplayServices(clinic.services)}
            openingHoursText={getOpeningHoursText(clinic.availableHours, clinic.is247) || null}
            is247={clinic.is247}
            is247Label={t("clinics.filter24Hour")}
          />
        ))}
      </div>
    </PlaceListingLayout>
  );
};

export default Clinics;
