"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PlaceListingLayout from "@/components/PlaceListingLayout";
import { HomeVisitListRow } from "@/components/HomeVisitListRow";
import { useFilteredHomeVisitProviders } from "@/hooks/useHomeVisitProviders";
import { useSearchQueryFromUrl } from "@/hooks/useSearchQueryFromUrl";
import { useSEO } from "@/hooks/useSEO";
import {
  getHomeVisitListOfferings,
  getServiceCategoryLabel,
  getSpeciesLabel,
  type HomeVisitProvider,
} from "@/services/homeVisitApi";

/** Only filters that split the job: urgency vs grooming. Species/services live on the rows + search. */
const NEED_FILTERS = ["grooming", "emergency"] as const;

const homeVisitsFAQ = [
  {
    question: "香港邊度有寵物上門服務？",
    answer:
      "香港有多間提供寵物上門診症、疫苗、健康檢查同急症支援嘅服務。PetWell 整理全港寵物上門服務列表，方便你按地區、寵物種類同服務類型篩選，再經 WhatsApp 或電話直接聯絡。",
  },
  {
    question: "寵物上門服務覆蓋邊啲地區？",
    answer:
      "每間服務嘅覆蓋範圍唔同：有啲全港上門，有啲只覆蓋指定區域或半徑範圍。PetWell 會顯示服務範圍摘要，幫你先確認會唔會去到你屋企附近。",
  },
  {
    question: "寵物上門服務收費點樣？",
    answer:
      "收費視乎診金、路程同服務類型。部分服務商會公開起步價或分區收費；如詳情頁未有價錢，建議用 WhatsApp 或電話查詢最新報價。",
  },
  {
    question: "點樣預約寵物上門服務？",
    answer:
      "多數服務需要預約。你可以喺詳情頁撳 WhatsApp、電話或網上預約連結聯絡服務商，確認時間、覆蓋範圍同收費。",
  },
];

const HomeVisits = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useSearchQueryFromUrl();
  const [show24HourOnly, setShow24HourOnly] = useState(false);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>("");
  const { t, i18n } = useTranslation();
  const lang: "zh" | "en" = i18n.language === "en" ? "en" : "zh";

  const { providers: filteredProviders, isLoading, error } = useFilteredHomeVisitProviders(
    {
      region: selectedRegion,
      keyword: searchQuery,
      is247: show24HourOnly || undefined,
      serviceCategory: selectedServiceCategory || undefined,
    },
    i18n.language,
  );

  const regions = [
    { value: "all", label: t("homeVisitPlaces.regions.all") },
    { value: "Kowloon", label: t("homeVisitPlaces.regions.kowloon") },
    { value: "Hong Kong", label: t("homeVisitPlaces.regions.hongKong") },
    { value: "New Territories", label: t("homeVisitPlaces.regions.newTerritories") },
  ];

  const activeFilterLabels = [
    ...(selectedRegion !== "all"
      ? [regions.find((region) => region.value === selectedRegion)?.label ?? ""]
      : []),
    ...(show24HourOnly ? [t("homeVisitPlaces.filter24Hour")] : []),
    ...(selectedServiceCategory
      ? [getServiceCategoryLabel(selectedServiceCategory, lang)]
      : []),
    ...(searchQuery.trim() ? [`"${searchQuery.trim()}"`] : []),
  ].filter(Boolean);

  const hasActiveFilters = activeFilterLabels.length > 0;

  const clearFilters = () => {
    setSelectedRegion("all");
    setSearchQuery("");
    setShow24HourOnly(false);
    setSelectedServiceCategory("");
  };

  const canonicalUrl = "https://petwellhk.com/home-visits";
  const seoTitle =
    "【2026】香港寵物上門服務｜上門診症、疫苗、急症｜PetWell HK";
  const seoDescription =
    "搜尋香港寵物上門服務：上門診症、疫苗接種、健康檢查同急症支援。按地區、寵物種類同服務範圍篩選，WhatsApp／電話一鍵聯絡。";
  const seoKeywords =
    "寵物上門服務,香港上門獸醫,寵物上門診症,上門疫苗,寵物急症上門,home visit vet hong kong";

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PetWell HK", item: "https://petwellhk.com/" },
          { "@type": "ListItem", position: 2, name: "香港寵物上門服務", item: canonicalUrl },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "香港寵物上門服務列表",
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: filteredProviders.length,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "香港寵物上門服務列表",
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: filteredProviders.length,
        itemListElement: filteredProviders
          .slice(0, 50)
          .map((provider: HomeVisitProvider, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "LocalBusiness",
              name: provider.name,
              url: `https://petwellhk.com/home-visits/${provider.id}`,
              telephone: provider.phone || undefined,
              description: provider.coverageSummary,
            },
          })),
      },
    ],
    [filteredProviders, seoDescription],
  );

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    canonicalUrl,
    structuredData,
    faqItems: homeVisitsFAQ,
    speakableSelectors: [".hero-summary", ".faq-answer", "h1"],
  });

  const policyFilters = [
    {
      id: "24hour",
      label: t("homeVisitPlaces.filter24Hour"),
      active: show24HourOnly,
      onToggle: () => setShow24HourOnly((value) => !value),
    },
    ...NEED_FILTERS.map((category) => ({
      id: `service-${category}`,
      label: getServiceCategoryLabel(category, lang),
      active: selectedServiceCategory === category,
      onToggle: () =>
        setSelectedServiceCategory((current) =>
          current === category ? "" : category,
        ),
    })),
  ];

  return (
    <PlaceListingLayout
      heroMode="find"
      title={t("homeVisitPlaces.pageTitle")}
      subtitle={t("homeVisitPlaces.subtitle")}
      description={t("homeVisitPlaces.description")}
      trustBadge={t("homeVisitPlaces.trustBadge")}
      searchPlaceholder={t("homeVisitPlaces.searchPlaceholder")}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterByRegionLabel={t("homeVisitPlaces.filterByRegion")}
      filtersLabel={t("homeVisitPlaces.filtersLabel")}
      regions={regions}
      selectedRegion={selectedRegion}
      onRegionChange={setSelectedRegion}
      policyFilters={policyFilters}
      activeFilterLabels={activeFilterLabels}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={clearFilters}
      clearFiltersLabel={t("homeVisitPlaces.clearFilters")}
      isLoading={isLoading}
      error={error}
      errorTitle={t("homeVisitPlaces.error")}
      errorSubtitle={t("homeVisitPlaces.errorSubtitle")}
      resultCount={filteredProviders.length}
      resultsCountLabel={t("homeVisitPlaces.resultsCount", { count: filteredProviders.length })}
      noResults={t("homeVisitPlaces.noResults")}
      noResultsHint={t("homeVisitPlaces.noResultsHint")}
      suggestPlaceCategory="homeVisit"
      listAriaLabel={t("homeVisitPlaces.pageTitle")}
      ctaTitle={t("homeVisitPlaces.ctaTitle")}
      ctaDescription={t("homeVisitPlaces.ctaDescription")}
      directQuestion="香港邊度有寵物上門服務？"
      directAnswer="香港有多間寵物上門診症同相關服務。PetWell 提供全港寵物上門服務列表，顯示服務範圍、寵物種類、WhatsApp／電話聯絡方式，方便主人預約上門。"
      faqItems={homeVisitsFAQ}
      faqTitle="寵物上門服務常見問題"
    >
      <div className="flex flex-col gap-3">
        {filteredProviders.map((provider) => (
            <HomeVisitListRow
              key={provider.id}
              name={provider.name}
              coverageSummary={provider.coverageSummary}
              district={provider.district}
              image={provider.image}
              detailPath={`/home-visits/${provider.id}`}
              offerings={getHomeVisitListOfferings(provider, lang)}
              speciesLabels={provider.speciesServed
                .slice(0, 4)
                .map((species) => getSpeciesLabel(species, lang))}
              rating={provider.rating}
              is247={provider.is247}
              is247Label={t("homeVisitPlaces.filter24Hour")}
            />
          ))}
      </div>
    </PlaceListingLayout>
  );
};

export default HomeVisits;
