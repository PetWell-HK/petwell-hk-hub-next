"use client";

import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PlaceListingLayout from "@/components/PlaceListingLayout";
import RestaurantDistrictLinks from "@/components/RestaurantDistrictLinks";
import { useFilteredRestaurants } from "@/hooks/useRestaurants";
import { useSearchQueryFromUrl } from "@/hooks/useSearchQueryFromUrl";
import { useSEO } from "@/hooks/useSEO";
import { getTodayOpeningHours } from "@/utils/availableHours";
import { RestaurantListCard } from "@/components/RestaurantListCard";
import { RestaurantListInfiniteLoader } from "@/components/restaurant/RestaurantListInfiniteLoader";
import restaurantsOgImage from "@/assets/restaurants-og.png.asset.json";

const Restaurants = () => {
  const location = useLocation();
  const isEnglishAlias = location.pathname === "/pet-friendly-restaurants-hk";
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useSearchQueryFromUrl();
  const [indoorAllowed, setIndoorAllowed] = useState<boolean>(false);
  const [walkInAllowed, setWalkInAllowed] = useState<boolean>(false);
  const [fehdLicensed, setFehdLicensed] = useState<boolean>(false);
  const { t, i18n } = useTranslation();

  const {
    restaurants,
    totalCount,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFilteredRestaurants(
    {
      region: selectedRegion,
      keyword: searchQuery,
      verifiedOnly: true,
      indoorAllowed,
      walkInAllowed,
      fehdLicensed,
    },
    i18n.language,
  );

  const restaurantsFAQ = useMemo(
    () => [
      { question: t("restaurants.faq.q1"), answer: t("restaurants.faq.a1") },
      { question: t("restaurants.faq.q2"), answer: t("restaurants.faq.a2") },
      { question: t("restaurants.faq.q3"), answer: t("restaurants.faq.a3") },
      { question: t("restaurants.faq.q4"), answer: t("restaurants.faq.a4") },
      { question: t("restaurants.faq.q5"), answer: t("restaurants.faq.a5") },
      { question: t("restaurants.faq.q6"), answer: t("restaurants.faq.a6") },
      { question: t("restaurants.faq.q7"), answer: t("restaurants.faq.a7") },
      { question: t("restaurants.faq.q8"), answer: t("restaurants.faq.a8") },
    ],
    [t],
  );

  const howToSteps = useMemo(
    () => ({
      name: t("restaurants.howTo.name"),
      description: t("restaurants.howTo.description"),
      steps: [
        { name: t("restaurants.howTo.step1Name"), text: t("restaurants.howTo.step1Text") },
        { name: t("restaurants.howTo.step2Name"), text: t("restaurants.howTo.step2Text") },
        { name: t("restaurants.howTo.step3Name"), text: t("restaurants.howTo.step3Text") },
        { name: t("restaurants.howTo.step4Name"), text: t("restaurants.howTo.step4Text") },
      ],
    }),
    [t],
  );

  const seoTitle = isEnglishAlias ? t("restaurants.enAliasSeoTitle") : t("restaurants.seoTitle");
  const seoDescription = isEnglishAlias
    ? t("restaurants.enAliasSeoDescription")
    : t("restaurants.seoDescription");
  const canonicalUrl = isEnglishAlias
    ? "https://petwellhk.com/pet-friendly-restaurants-hk"
    : "https://petwellhk.com/restaurants";

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PetWell HK", item: "https://petwellhk.com/" },
          {
            "@type": "ListItem",
            position: 2,
            name: t("restaurants.pageTitle"),
            item: canonicalUrl,
          },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: t("restaurants.seoStructuredDataName"),
        description: seoDescription,
        url: canonicalUrl,
        numberOfItems: totalCount,
      },
    ],
    [totalCount, t, seoDescription, canonicalUrl],
  );

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: t("restaurants.seoKeywords"),
    ogImage: `https://petwell-hk-hub.lovable.app${restaurantsOgImage.url}`,
    canonicalUrl,
    structuredData,
    faqItems: restaurantsFAQ,
    howToSteps,
    speakableSelectors: [
      ".hero-summary",
      ".faq-answer",
      ".restaurants-search-intent",
      ".restaurants-hub-seo",
      "h1",
    ],
  });

  const regions = [
    { value: "all", label: t("restaurants.regions.all") },
    { value: "Kowloon", label: t("restaurants.regions.kowloon") },
    { value: "Hong Kong", label: t("restaurants.regions.hongKong") },
    { value: "New Territories", label: t("restaurants.regions.newTerritories") },
    { value: "Others", label: t("restaurants.regions.others") },
  ];

  const activeFilterLabels = [
    ...(selectedRegion !== "all"
      ? [regions.find((region) => region.value === selectedRegion)?.label ?? ""]
      : []),
    ...(indoorAllowed ? [t("restaurant.petAccessArea.indoorAllowed")] : []),
    ...(walkInAllowed ? [t("restaurants.filterWalkIn")] : []),
    ...(fehdLicensed ? [t("restaurants.filterFehdLicensed")] : []),
    ...(searchQuery.trim() ? [`"${searchQuery.trim()}"`] : []),
  ].filter(Boolean);

  const hasActiveFilters = activeFilterLabels.length > 0;

  const clearFilters = () => {
    setSelectedRegion("all");
    setSearchQuery("");
    setIndoorAllowed(false);
    setWalkInAllowed(false);
    setFehdLicensed(false);
  };

  const getPetEntryPolicyLabel = (policy?: string) => {
    switch (policy) {
      case "WALK_IN_ONLY":
        return t("restaurant.petEntryPolicy.walkInOnly");
      case "RESERVATION_REQUIRED":
        return t("restaurant.petEntryPolicy.reservationRequired");
      case "BOTH":
        return t("restaurant.petEntryPolicy.both");
      default:
        return null;
    }
  };

  const getPetAccessAreaLabel = (area?: string) => {
    switch (area) {
      case "INDOOR_ALLOWED":
        return t("restaurant.petAccessArea.indoorAllowed");
      case "OUTDOOR_ONLY":
        return t("restaurant.petAccessArea.outdoorOnly");
      default:
        return null;
    }
  };

  const getOpeningHoursText = (availableHours: unknown, is247?: boolean) =>
    getTodayOpeningHours(availableHours, is247, t);

  const pageTitle = isEnglishAlias ? t("restaurants.enAliasPageTitle") : t("restaurants.pageTitle");
  const pageSubtitle = isEnglishAlias ? t("restaurants.enAliasSubtitle") : t("restaurants.subtitle");

  return (
    <PlaceListingLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      description={isEnglishAlias ? t("restaurants.enAliasDescription") : t("restaurants.description")}
      searchIntent={t("restaurants.searchIntent")}
      searchIntentClassName="restaurants-search-intent"
      trustBadge={t("restaurants.verifiedPanelTitle")}
      searchPlaceholder={t("restaurants.searchPlaceholder")}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterByRegionLabel={t("restaurants.filterByRegion")}
      filtersLabel={t("restaurants.filtersLabel")}
      regions={regions}
      selectedRegion={selectedRegion}
      onRegionChange={setSelectedRegion}
      policyFilters={[
        {
          id: "indoor",
          label: t("restaurant.petAccessArea.indoorAllowed"),
          active: indoorAllowed,
          onToggle: () => setIndoorAllowed((value) => !value),
        },
        {
          id: "walkin",
          label: t("restaurants.filterWalkIn"),
          active: walkInAllowed,
          onToggle: () => setWalkInAllowed((value) => !value),
        },
        {
          id: "fehd",
          label: t("restaurants.filterFehdLicensed"),
          active: fehdLicensed,
          onToggle: () => setFehdLicensed((value) => !value),
        },
      ]}
      activeFilterLabels={activeFilterLabels}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={clearFilters}
      clearFiltersLabel={t("restaurants.clearFilters")}
      isLoading={isLoading}
      error={error}
      errorTitle={t("restaurants.error")}
      errorSubtitle={t("restaurants.errorSubtitle")}
      resultCount={restaurants.length}
      hasMoreToLoad={hasNextPage}
      partialEmptyMessage={t("restaurants.noResults")}
      partialEmptyHint={t("restaurants.searchingMore")}
      resultsCountLabel=""
      noResults={t("restaurants.noResults")}
      noResultsHint={t("restaurants.noResultsHint")}
      suggestPlaceCategory="restaurant"
      listAriaLabel="寵物友善餐廳列表"
      ctaTitle={t("restaurants.ctaTitle")}
      ctaDescription={t("restaurants.ctaDescription")}
      directQuestion={t("restaurants.directQuestion")}
      directAnswer={t("restaurants.directAnswer")}
      directAnswerHidden={false}
      faqItems={restaurantsFAQ}
      faqTitle={t("restaurants.faqTitle")}
      faqHidden={false}
      listFooterContent={
        <RestaurantListInfiniteLoader
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      }
      belowListContent={
        <div className="restaurants-hub-seo space-y-6">
            <section>
              <h2 className="text-lg font-semibold">{t("restaurants.hubSeo.title")}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {t("restaurants.hubSeo.body")}
              </p>
            </section>
            <section>
              <h3 className="text-base font-semibold">{t("restaurants.communityReviewsTitle")}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {t("restaurants.communityReviewsBody")}
              </p>
            </section>
            <RestaurantDistrictLinks showCounts={false} />
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {restaurants.map((restaurant) => (
          <RestaurantListCard
            key={restaurant.id}
            restaurant={restaurant}
            petAccessLabel={getPetAccessAreaLabel(restaurant.petAccessArea)}
            petEntryLabel={getPetEntryPolicyLabel(restaurant.petEntryPolicy)}
            openingHoursText={
              getTodayOpeningHours(restaurant.availableHours, restaurant.is247, t) || null
            }
          />
        ))}
      </div>
    </PlaceListingLayout>
  );
};

export default Restaurants;
