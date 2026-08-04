import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PlaceListingLayout from "@/components/PlaceListingLayout";
import { ListInfiniteLoader } from "@/components/ListInfiniteLoader";
import { PlaceListCard } from "@/components/PlaceListCard";
import { useFilteredLodgings } from "@/hooks/useLodging";
import { useSearchQueryFromUrl } from "@/hooks/useSearchQueryFromUrl";
import { useSEO } from "@/hooks/useSEO";
import { translateServiceOfferings } from "@/utils/serviceOfferings";
import { getTodayOpeningHours } from "@/utils/availableHours";

const lodgingFAQ = [
  {
    question: "香港寵物寄養邊間好？點樣揀寵物酒店？",
    answer:
      "揀寵物寄養可以參考PetWell上嘅真實用戶評價、設施（冷氣、戶外空間、監控）、收費同地點。建議選擇評分4分以上、有良好口碑、提供你需要嘅服務（如大型犬、多寵同住）嘅寄養場所。",
  },
  {
    question: "寵物寄養收費大概幾多？",
    answer:
      "寵物寄養收費視乎體型、日數同服務。小型犬約$150-300/日，中型犬約$250-400/日，大型犬約$350-600/日或以上。部分提供接送、加餵等附加服務。PetWell提供各寄養場所評價同參考。",
  },
  {
    question: "寵物寄養要預約嗎？",
    answer:
      "節日同長假期寵物寄養需求大，建議提早預約。你可以喺PetWell睇各場所資料同用戶評價，再致電預約。部分支援即日或短期寄養。",
  },
  {
    question: "貓貓可以寄養嗎？",
    answer:
      "可以。唔少寵物寄養場所都接受貓貓，有獨立空間同照顧。你可以喺PetWell按地區篩選，睇各場所服務項目同用戶評價。",
  },
];

const Lodging = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useSearchQueryFromUrl();
  const [show24HourOnly, setShow24HourOnly] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const {
    lodgings: filteredLodgings,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFilteredLodgings(
    {
      region: selectedRegion,
      keyword: searchQuery,
      is247: show24HourOnly || undefined,
    },
    i18n.language,
  );

  const regions = [
    { value: "all", label: t("lodging.regions.all") },
    { value: "Kowloon", label: t("lodging.regions.kowloon") },
    { value: "Hong Kong", label: t("lodging.regions.hongKong") },
    { value: "New Territories", label: t("lodging.regions.newTerritories") },
    { value: "Others", label: t("lodging.regions.others") },
  ];

  const activeFilterLabels = [
    ...(selectedRegion !== "all"
      ? [regions.find((region) => region.value === selectedRegion)?.label ?? ""]
      : []),
    ...(show24HourOnly ? [t("lodging.filter24Hour")] : []),
    ...(searchQuery.trim() ? [`"${searchQuery.trim()}"`] : []),
  ].filter(Boolean);

  const hasActiveFilters = activeFilterLabels.length > 0;

  const clearFilters = () => {
    setSelectedRegion("all");
    setSearchQuery("");
    setShow24HourOnly(false);
  };

  const canonicalUrl = "https://petwellhk.com/lodging";
  const seoDescription =
    "香港寵物寄養、寵物酒店搜尋、用戶評價、設施與收費參考。狗狗貓貓寄養、假期託管，九龍、港島、新界全覆蓋。";

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PetWell HK", item: "https://petwellhk.com/" },
          { "@type": "ListItem", position: 2, name: t("lodging.pageTitle"), item: canonicalUrl },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "香港寵物寄養列表",
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: filteredLodgings.length,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "香港寵物寄養列表",
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: filteredLodgings.length,
        itemListElement: filteredLodgings.slice(0, 50).map((lodging, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "LodgingBusiness",
            name: lodging.name,
            url: `https://petwellhk.com/lodging/${lodging.id}`,
            address: lodging.address,
            telephone: lodging.phone,
            ...(lodging.rating && {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: lodging.rating,
                bestRating: 5,
                reviewCount: lodging.totalReviews,
              },
            }),
          },
        })),
      },
    ],
    [filteredLodgings, t, seoDescription],
  );

  useSEO({
    title: "寵物寄養 | 香港寵物酒店、寵物寄養搜尋及評價 | PetWell HK",
    description: seoDescription,
    keywords: "寵物寄養,香港寵物寄養,寵物酒店,狗狗寄養,貓貓寄養,寵物託管,寵物住宿推薦",
    canonicalUrl,
    structuredData,
    faqItems: lodgingFAQ,
    speakableSelectors: [".hero-summary", ".faq-answer", "h1"],
  });

  const getDisplayServices = (services: string[]) =>
    translateServiceOfferings(services, i18n.language);
  const getOpeningHoursText = (availableHours: unknown, is247?: boolean) =>
    getTodayOpeningHours(availableHours, is247, t);

  return (
    <PlaceListingLayout
      title={t("lodging.pageTitle")}
      subtitle={t("lodging.subtitle")}
      description={t("lodging.description")}
      trustBadge={t("lodging.trustBadge")}
      searchPlaceholder={t("lodging.searchPlaceholder")}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterByRegionLabel={t("lodging.filterByRegion")}
      filtersLabel={t("lodging.filtersLabel")}
      regions={regions}
      selectedRegion={selectedRegion}
      onRegionChange={setSelectedRegion}
      policyFilters={[
        {
          id: "24hour",
          label: t("lodging.filter24Hour"),
          active: show24HourOnly,
          onToggle: () => setShow24HourOnly((value) => !value),
        },
      ]}
      activeFilterLabels={activeFilterLabels}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={clearFilters}
      clearFiltersLabel={t("lodging.clearFilters")}
      isLoading={isLoading}
      error={error}
      errorTitle={t("lodging.error")}
      errorSubtitle={t("lodging.errorSubtitle")}
      resultCount={filteredLodgings.length}
      hasMoreToLoad={hasNextPage}
      resultsCountLabel={t("lodging.resultsCount", { count: filteredLodgings.length })}
      noResults={t("lodging.noResults")}
      noResultsHint={t("lodging.noResultsHint")}
      suggestPlaceCategory="lodging"
      listAriaLabel={t("lodging.pageTitle")}
      listFooterContent={
        <ListInfiniteLoader
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          loadMoreLabel={t("lodging.loadMore")}
          loadingLabel={t("lodging.loading")}
        />
      }
      ctaTitle={t("lodging.ctaTitle")}
      ctaDescription={t("lodging.ctaDescription")}
      directQuestion="香港邊度有寵物寄養？點樣揀寵物酒店？"
      directAnswer="香港各區都有寵物寄養場所同寵物酒店，你可以喺PetWell按地區瀏覽真實用戶評價、設施同收費參考，搵到最適合毛孩嘅寄養場所。"
      faqItems={lodgingFAQ}
      faqTitle="寵物寄養常見問題"
    >
      <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {filteredLodgings.map((lodging) => (
          <PlaceListCard
            key={lodging.id}
            name={lodging.name}
            district={lodging.district}
            address={lodging.address}
            rating={lodging.rating}
            image={lodging.image}
            verified={lodging.verified}
            isPremium={lodging.isPremium}
            detailPath={`/lodging/${lodging.id}`}
            serviceLabels={getDisplayServices(lodging.services)}
            openingHoursText={getOpeningHoursText(lodging.availableHours, lodging.is247) || null}
            is247={lodging.is247}
            is247Label={t("lodging.filter24Hour")}
          />
        ))}
      </div>
    </PlaceListingLayout>
  );
};

export default Lodging;
