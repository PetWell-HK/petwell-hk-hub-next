"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PlaceListingLayout from "@/components/PlaceListingLayout";
import { ListInfiniteLoader } from "@/components/ListInfiniteLoader";
import { PlaceListCard } from "@/components/PlaceListCard";
import { useFilteredSalons } from "@/hooks/useSalons";
import { useSearchQueryFromUrl } from "@/hooks/useSearchQueryFromUrl";
import { useSEO } from "@/hooks/useSEO";
import { translateServiceOfferings } from "@/utils/serviceOfferings";
import { getTodayOpeningHours } from "@/utils/availableHours";

const salonsFAQ = [
  {
    question: "香港寵物美容邊間好？點樣揀寵物美容店？",
    answer:
      "揀寵物美容可以參考PetWell上嘅真實用戶評價、服務項目（剪毛、沖涼、護理）、收費同地點。建議選擇評分4分以上、有良好口碑、提供你需要嘅服務（如大型犬、貓貓美容）嘅美容店。",
  },
  {
    question: "寵物美容收費大概幾多？",
    answer:
      "寵物美容收費視乎體型、毛長同服務項目。小型犬沖涼剪毛約$200-400，中型犬約$300-500，大型犬約$500-800或以上。貓貓美容通常另計。PetWell提供各美容店評價同參考。",
  },
  {
    question: "寵物美容要預約嗎？",
    answer:
      "大部分寵物美容店都建議預約，尤其週末同節日前。你可以喺PetWell睇各店資料，再致電預約。部分店舖支援即日預約。",
  },
  {
    question: "貓貓可以喺邊度美容？",
    answer:
      "唔少寵物美容店都有提供貓貓美容服務，包括沖涼、修甲、去毛球等。你可以喺PetWell按地區篩選，睇各店服務項目同用戶評價。",
  },
];

const Salons = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useSearchQueryFromUrl();
  const [show24HourOnly, setShow24HourOnly] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const {
    salons: filteredSalons,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFilteredSalons(
    {
      region: selectedRegion,
      keyword: searchQuery,
      is247: show24HourOnly || undefined,
    },
    i18n.language,
  );

  const regions = [
    { value: "all", label: t("salons.regions.all") },
    { value: "Kowloon", label: t("salons.regions.kowloon") },
    { value: "Hong Kong", label: t("salons.regions.hongKong") },
    { value: "New Territories", label: t("salons.regions.newTerritories") },
    { value: "Others", label: t("salons.regions.others") },
  ];

  const activeFilterLabels = [
    ...(selectedRegion !== "all"
      ? [regions.find((region) => region.value === selectedRegion)?.label ?? ""]
      : []),
    ...(show24HourOnly ? [t("salons.filter24Hour")] : []),
    ...(searchQuery.trim() ? [`"${searchQuery.trim()}"`] : []),
  ].filter(Boolean);

  const hasActiveFilters = activeFilterLabels.length > 0;

  const clearFilters = () => {
    setSelectedRegion("all");
    setSearchQuery("");
    setShow24HourOnly(false);
  };

  const canonicalUrl = "https://petwellhk.com/salons";
  const seoDescription =
    "香港寵物美容店搜尋、用戶評價、服務項目與收費參考。狗狗剪毛、沖涼、貓貓美容，九龍、港島、新界全覆蓋。";

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PetWell HK", item: "https://petwellhk.com/" },
          { "@type": "ListItem", position: 2, name: t("salons.pageTitle"), item: canonicalUrl },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "香港寵物美容列表",
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: filteredSalons.length,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "香港寵物美容列表",
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: filteredSalons.length,
        itemListElement: filteredSalons.slice(0, 50).map((salon, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "LocalBusiness",
            name: salon.name,
            url: `https://petwellhk.com/salons/${salon.id}`,
            address: salon.address,
            telephone: salon.phone,
            ...(salon.rating && {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: salon.rating,
                bestRating: 5,
                reviewCount: salon.totalReviews,
              },
            }),
          },
        })),
      },
    ],
    [filteredSalons, t, seoDescription],
  );

  useSEO({
    title: "寵物美容 | 香港寵物美容店搜尋及評價 | PetWell HK",
    description: seoDescription,
    keywords: "寵物美容,香港寵物美容,狗狗美容,貓貓美容,寵物剪毛,寵物沖涼,寵物美容店推薦",
    canonicalUrl,
    structuredData,
    faqItems: salonsFAQ,
    speakableSelectors: [".hero-summary", ".faq-answer", "h1"],
  });

  const getDisplayServices = (services: string[]) =>
    translateServiceOfferings(services, i18n.language);
  const getOpeningHoursText = (availableHours: unknown, is247?: boolean) =>
    getTodayOpeningHours(availableHours, is247, t);

  return (
    <PlaceListingLayout
      title={t("salons.pageTitle")}
      subtitle={t("salons.subtitle")}
      description={t("salons.description")}
      trustBadge={t("salons.trustBadge")}
      searchPlaceholder={t("salons.searchPlaceholder")}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterByRegionLabel={t("salons.filterByRegion")}
      filtersLabel={t("salons.filtersLabel")}
      regions={regions}
      selectedRegion={selectedRegion}
      onRegionChange={setSelectedRegion}
      policyFilters={[
        {
          id: "24hour",
          label: t("salons.filter24Hour"),
          active: show24HourOnly,
          onToggle: () => setShow24HourOnly((value) => !value),
        },
      ]}
      activeFilterLabels={activeFilterLabels}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={clearFilters}
      clearFiltersLabel={t("salons.clearFilters")}
      isLoading={isLoading}
      error={error}
      errorTitle={t("salons.error")}
      errorSubtitle={t("salons.errorSubtitle")}
      resultCount={filteredSalons.length}
      hasMoreToLoad={hasNextPage}
      resultsCountLabel={t("salons.resultsCount", { count: filteredSalons.length })}
      noResults={t("salons.noResults")}
      noResultsHint={t("salons.noResultsHint")}
      suggestPlaceCategory="salon"
      listAriaLabel={t("salons.pageTitle")}
      listFooterContent={
        <ListInfiniteLoader
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          loadMoreLabel={t("salons.loadMore")}
          loadingLabel={t("salons.loading")}
        />
      }
      ctaTitle={t("salons.ctaTitle")}
      ctaDescription={t("salons.ctaDescription")}
      directQuestion="香港邊度有寵物美容？點樣揀寵物美容店？"
      directAnswer="香港各區都有寵物美容店，你可以喺PetWell按地區瀏覽真實用戶評價、服務項目同收費參考，搵到最適合毛孩嘅美容店。"
      faqItems={salonsFAQ}
      faqTitle="寵物美容常見問題"
    >
      <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {filteredSalons.map((salon) => (
          <PlaceListCard
            key={salon.id}
            name={salon.name}
            district={salon.district}
            address={salon.address}
            rating={salon.rating}
            image={salon.image}
            verified={salon.verified}
            isPremium={salon.isPremium}
            detailPath={`/salons/${salon.id}`}
            serviceLabels={getDisplayServices(salon.services)}
            openingHoursText={getOpeningHoursText(salon.availableHours, salon.is247) || null}
            is247={salon.is247}
            is247Label={t("salons.filter24Hour")}
          />
        ))}
      </div>
    </PlaceListingLayout>
  );
};

export default Salons;
