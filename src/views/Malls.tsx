"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PlaceListingLayout from "@/components/PlaceListingLayout";
import { PlaceListCard } from "@/components/PlaceListCard";
import { useFilteredMalls } from "@/hooks/useMalls";
import { useSearchQueryFromUrl } from "@/hooks/useSearchQueryFromUrl";
import { getTodayOpeningHours, localizeOpeningHoursText } from "@/utils/availableHours";
import {
  getMallMovementLabel,
  getMallPetsAllowedLabel,
  type Mall,
} from "@/services/mallApi";

const mallsFAQ = [
  {
    question: "2026 年香港有咩寵物友善商場？",
    answer:
      "2026 年最新資料顯示，香港九龍、港島同新界都有不少寵物友善商場。PetWell 收錄最詳盡商場列表，列出每間商場嘅帶狗政策、牽繩／推車規定、指定步行區、開放時間同泊車資訊，方便主人出發前一次過查清楚。",
  },
  {
    question: "帶狗入商場有咩要注意？",
    answer:
      "每間商場寵物政策不同：有啲可以牽繩步行，有啲只可以推車／抱住，有啲只限指定樓層或戶外區。出發前建議睇 PetWell 列出嘅最詳盡政策摘要，避免因違規被職員勸退。",
  },
  {
    question: "商場有冇寵物友善餐廳？",
    answer:
      "部分商場設有寵物友善食肆或會提供寵物餐廳名單。商場詳情頁會顯示相關政策摘要；你亦可以同時瀏覽 PetWell 嘅寵物友善餐廳列表，搵返附近最多真實評價嘅餐廳。",
  },
  {
    question: "落雨天帶狗去邊度好？",
    answer:
      "寵物友善商場係雨天室內活動好選擇。PetWell 提供 2026 年最新商場開放時間同寵物政策，你可以喺列表篩選歡迎寵物嘅商場，再睇指定步行區同交通提示。",
  },
];

const Malls = ({ initialMalls = null }: { initialMalls?: Mall[] | null }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useSearchQueryFromUrl();
  const [petsAllowedYes, setPetsAllowedYes] = useState(false);
  const [leashWalkOk, setLeashWalkOk] = useState(false);
  const { t, i18n } = useTranslation();
  const lang: "zh" | "en" = i18n.language === "en" ? "en" : "zh";

  const { malls: filteredMalls, isLoading, error } = useFilteredMalls(
    {
      region: selectedRegion,
      keyword: searchQuery,
      petsAllowedYes: petsAllowedYes || undefined,
      leashWalkOk: leashWalkOk || undefined,
    },
    i18n.language,
    initialMalls,
  );

  const regions = [
    { value: "all", label: t("mallPlaces.regions.all") },
    { value: "Kowloon", label: t("mallPlaces.regions.kowloon") },
    { value: "Hong Kong", label: t("mallPlaces.regions.hongKong") },
    { value: "New Territories", label: t("mallPlaces.regions.newTerritories") },
    { value: "Others", label: t("mallPlaces.regions.others") },
  ];

  const activeFilterLabels = [
    ...(selectedRegion !== "all"
      ? [regions.find((region) => region.value === selectedRegion)?.label ?? ""]
      : []),
    ...(petsAllowedYes ? [t("mallPlaces.filterPetsYes")] : []),
    ...(leashWalkOk ? [t("mallPlaces.filterLeashWalk")] : []),
    ...(searchQuery.trim() ? [`"${searchQuery.trim()}"`] : []),
  ].filter(Boolean);

  const hasActiveFilters = activeFilterLabels.length > 0;

  const clearFilters = () => {
    setSelectedRegion("all");
    setSearchQuery("");
    setPetsAllowedYes(false);
    setLeashWalkOk(false);
  };

  const canonicalUrl = "https://petwellhk.com/malls";
  const seoTitle =
    "【2026 最新】香港寵物友善商場｜最詳盡帶狗入商場政策及商場列表｜PetWell HK";
  const seoDescription =
    "2026 年最新更新：全港最詳盡寵物友善商場指南，涵蓋帶狗入商場政策、牽繩／推車規定、指定步行區、開放時間、泊車與交通提示。九龍、港島、新界商場一覽。";
  const seoKeywords =
    "寵物友善商場,帶狗入商場,香港寵物商場,2026 最新,最詳盡,寵物友善 shopping mall,帶狗逛街,商場寵物政策";

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PetWell HK", item: "https://petwellhk.com/" },
          { "@type": "ListItem", position: 2, name: "【2026 最新】香港寵物友善商場", item: canonicalUrl },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "【2026 最新】香港寵物友善商場列表",
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: filteredMalls.length,
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "2026 最詳盡香港寵物友善商場列表",
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: filteredMalls.length,
        itemListElement: filteredMalls.slice(0, 50).map((mall: Mall, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "ShoppingCenter",
            name: mall.name,
            url: `https://petwellhk.com/malls/${mall.id}`,
            address: mall.address,
            telephone: mall.phone || undefined,
          },
        })),
      },
    ],
    [filteredMalls, t, seoDescription],
  );


  const getOpeningHoursText = (mall: Mall) =>
    getTodayOpeningHours(mall.availableHours, false, t) ||
    localizeOpeningHoursText(mall.hoursSummary, i18n.language) ||
    null;

  const getPolicyLabels = (mall: Mall) => {
    const labels: string[] = [];
    if (mall.petsAllowed === "YES") {
      labels.push(getMallPetsAllowedLabel("YES", lang));
    }
    if (mall.petMovementMode && mall.petMovementMode !== "UNKNOWN") {
      labels.push(getMallMovementLabel(mall.petMovementMode, lang));
    }
    return labels;
  };

  return (
    <PlaceListingLayout
      title={t("mallPlaces.pageTitle")}
      subtitle={t("mallPlaces.subtitle")}
      description={t("mallPlaces.description")}
      trustBadge={t("mallPlaces.trustBadge")}
      searchPlaceholder={t("mallPlaces.searchPlaceholder")}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterByRegionLabel={t("mallPlaces.filterByRegion")}
      filtersLabel={t("mallPlaces.filtersLabel")}
      regions={regions}
      selectedRegion={selectedRegion}
      onRegionChange={setSelectedRegion}
      policyFilters={[
        {
          id: "pets-yes",
          label: t("mallPlaces.filterPetsYes"),
          active: petsAllowedYes,
          onToggle: () => setPetsAllowedYes((value) => !value),
        },
        {
          id: "leash-walk",
          label: t("mallPlaces.filterLeashWalk"),
          active: leashWalkOk,
          onToggle: () => setLeashWalkOk((value) => !value),
        },
      ]}
      activeFilterLabels={activeFilterLabels}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={clearFilters}
      clearFiltersLabel={t("mallPlaces.clearFilters")}
      isLoading={isLoading}
      error={error}
      errorTitle={t("mallPlaces.error")}
      errorSubtitle={t("mallPlaces.errorSubtitle")}
      resultCount={filteredMalls.length}
      resultsCountLabel={t("mallPlaces.resultsCount", { count: filteredMalls.length })}
      noResults={t("mallPlaces.noResults")}
      noResultsHint={t("mallPlaces.noResultsHint")}
      suggestPlaceCategory="mall"
      listAriaLabel={t("mallPlaces.pageTitle")}
      ctaTitle={t("mallPlaces.ctaTitle")}
      ctaDescription={t("mallPlaces.ctaDescription")}
      directQuestion="2026 年香港邊度有寵物友善商場？"
      directAnswer="2026 年最新更新：香港各區都有歡迎寵物嘅商場。PetWell 提供最詳盡全港寵物友善商場列表，包括帶狗入商場政策、牽繩／推車規定、指定步行區、開放時間同交通提示，出發前記得查清楚。"
      faqItems={mallsFAQ}
      faqTitle="寵物友善商場常見問題"
    >
      <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {filteredMalls.map((mall) => (
          <PlaceListCard
            key={mall.id}
            name={mall.name}
            district={mall.district}
            address={mall.address}
            rating={0}
            image={mall.image}
            verified={mall.verified}
            detailPath={`/malls/${mall.id}`}
            serviceLabels={getPolicyLabels(mall)}
            openingHoursText={getOpeningHoursText(mall)}
          />
        ))}
      </div>
    </PlaceListingLayout>
  );
};

export default Malls;
