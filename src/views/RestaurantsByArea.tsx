import { Link, Navigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlaceListingLayout from "@/components/PlaceListingLayout";
import FehdPetFriendlyDirectory from "@/components/FehdPetFriendlyDirectory";
import RestaurantDistrictLinks from "@/components/RestaurantDistrictLinks";
import { RestaurantListCard } from "@/components/RestaurantListCard";
import { RestaurantListInfiniteLoader } from "@/components/restaurant/RestaurantListInfiniteLoader";
import { useFilteredRestaurants } from "@/hooks/useRestaurants";
import { useSearchQueryFromUrl } from "@/hooks/useSearchQueryFromUrl";
import { useSEO } from "@/hooks/useSEO";
import { getTodayOpeningHours } from "@/utils/availableHours";
import {
  resolveAreaSlug,
} from "@/data/hongKong18Districts";
import type { RestaurantFilters } from "@/hooks/useRestaurants";

function getFehdRegionForDistrict(labelZh: string, regionKey: string): string {
  if (regionKey === "離島") return "新界區";
  if (regionKey === "香港") return "港島區";
  if (regionKey === "九龍") return "九龍區";
  return "新界區";
}

const RestaurantsByArea = () => {
  const { areaSlug } = useParams<{ areaSlug: string }>();
  const area = resolveAreaSlug(areaSlug);
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const [indoorAllowed, setIndoorAllowed] = useState(false);
  const [walkInAllowed, setWalkInAllowed] = useState(false);
  const [searchQuery, setSearchQuery] = useSearchQueryFromUrl();

  const listingFilters = useMemo((): RestaurantFilters => {
    const filters: RestaurantFilters = {
      verifiedOnly: true,
      keyword: searchQuery,
      indoorAllowed,
      walkInAllowed,
    };

    if (area?.type === "region") {
      filters.region = area.region.filterRegion;
    } else if (area?.type === "district") {
      // Prefer Chinese neighborhood + admin aliases so 元朗區 pages also match 元朗 rows
      const zhFilterValues = area.district.filterValues.filter((value) =>
        /[\u4e00-\u9fff]/.test(value),
      );
      filters.selectedDistricts =
        zhFilterValues.length > 0 ? zhFilterValues : [area.district.labelZh];
    }

    return filters;
  }, [area, searchQuery, indoorAllowed, walkInAllowed]);

  const {
    restaurants: areaRestaurants,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFilteredRestaurants(listingFilters, i18n.language);

  const seoContext = useMemo(() => {
    if (!area || area.type === "index") {
      return {
        title: t("restaurants.districtPage.indexSeoTitle"),
        description: t("restaurants.districtPage.indexSeoDescription"),
        keywords: t("restaurants.districtPage.indexSeoKeywords"),
        canonicalUrl: "https://petwellhk.com/pet-friendly-restaurants/districts",
        pageTitle: t("restaurants.districtPage.indexTitle"),
        subtitle: t("restaurants.districtPage.indexSubtitle"),
        areaLabel: "",
        regionLabel: "",
      };
    }

    if (area.type === "district") {
      const label = isEn ? area.district.labelEn : area.district.labelZh;
      const region = isEn ? area.district.regionLabelEn : area.district.regionLabelZh;
      return {
        title: t("restaurants.districtPage.seoTitle", { district: label }),
        description: t("restaurants.districtPage.seoDescription", {
          district: label,
          count: areaRestaurants.length,
          region,
        }),
        keywords: t("restaurants.districtPage.seoKeywords", { district: label, region }),
        canonicalUrl: `https://petwellhk.com/pet-friendly-restaurants/${area.district.slug}`,
        pageTitle: t("restaurants.districtPage.pageTitle", { district: label }),
        subtitle: t("restaurants.districtPage.subtitle", { district: label, region }),
        areaLabel: label,
        regionLabel: region,
        district: area.district,
      };
    }

    const label = isEn ? area.region.labelEn : area.region.labelZh;
    return {
      title: t("restaurants.regionPage.seoTitle", { region: label }),
      description: t("restaurants.regionPage.seoDescription", {
        region: label,
        count: areaRestaurants.length,
      }),
      keywords: t("restaurants.regionPage.seoKeywords", { region: label }),
      canonicalUrl: `https://petwellhk.com/pet-friendly-restaurants/${area.region.slug}`,
      pageTitle: t("restaurants.regionPage.pageTitle", { region: label }),
      subtitle: t("restaurants.regionPage.subtitle", { region: label }),
      areaLabel: label,
      regionLabel: label,
    };
  }, [area, areaRestaurants.length, isEn, t]);

  const faqItems = useMemo(() => {
    if (area?.type === "index") {
      return [
        { question: t("restaurants.districtPage.indexFaq.q1"), answer: t("restaurants.districtPage.indexFaq.a1") },
        { question: t("restaurants.districtPage.indexFaq.q2"), answer: t("restaurants.districtPage.indexFaq.a2") },
      ];
    }
    const label = seoContext.areaLabel;
    return [
      { question: t("restaurants.districtPage.faq.q1", { district: label }), answer: t("restaurants.districtPage.faq.a1", { district: label, count: areaRestaurants.length }) },
      { question: t("restaurants.districtPage.faq.q2", { district: label }), answer: t("restaurants.districtPage.faq.a2", { district: label }) },
      { question: t("restaurants.faq.q5"), answer: t("restaurants.faq.a5") },
      { question: t("restaurants.faq.q6"), answer: t("restaurants.faq.a6") },
    ];
  }, [area?.type, areaRestaurants.length, seoContext.areaLabel, t]);

  const structuredData = useMemo(() => {
    const breadcrumbName =
      area?.type === "index"
        ? t("restaurants.districtPage.indexTitle")
        : seoContext.pageTitle;

    return [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PetWell HK", item: "https://petwellhk.com/" },
          { "@type": "ListItem", position: 2, name: t("restaurants.pageTitle"), item: "https://petwellhk.com/restaurants" },
          { "@type": "ListItem", position: 3, name: breadcrumbName, item: seoContext.canonicalUrl },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: seoContext.pageTitle,
        description: seoContext.description,
        url: seoContext.canonicalUrl,
        numberOfItems: areaRestaurants.length,
      },
    ];
  }, [area?.type, areaRestaurants.length, seoContext, t]);

  useSEO({
    title: seoContext.title,
    description: seoContext.description,
    keywords: seoContext.keywords,
    canonicalUrl: seoContext.canonicalUrl,
    structuredData,
    faqItems,
    speakableSelectors: [".hero-summary", ".restaurants-area-seo", "h1"],
  });

  if (!area) {
    return <Navigate to="/restaurants" replace />;
  }

  if (area.type === "index") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-14">
          <div className="container mx-auto max-w-6xl px-4 pt-8 md:pt-10">
            <header className="hero-summary">
              <h1 className="text-2xl font-bold md:text-3xl">{seoContext.pageTitle}</h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">{seoContext.subtitle}</p>
            </header>
            <RestaurantDistrictLinks showCounts={false} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const indoorCount = areaRestaurants.filter((r) => r.petAccessArea === "INDOOR_ALLOWED").length;
  const walkInCount = areaRestaurants.filter(
    (r) => r.petEntryPolicy === "WALK_IN_ONLY" || r.petEntryPolicy === "BOTH",
  ).length;

  const fehdDistrict =
    area.type === "district" ? area.district.labelZh.replace(/區$/, "") : undefined;
  const fehdRegion =
    area.type === "district"
      ? getFehdRegionForDistrict(area.district.labelZh, area.district.regionKey)
      : area.type === "region"
        ? area.region.regionKey === "香港"
          ? "港島區"
          : area.region.regionKey === "九龍"
            ? "九龍區"
            : "新界區"
        : undefined;

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

  const getPetAccessAreaLabel = (areaValue?: string) => {
    switch (areaValue) {
      case "INDOOR_ALLOWED":
        return t("restaurant.petAccessArea.indoorAllowed");
      case "OUTDOOR_ONLY":
        return t("restaurant.petAccessArea.outdoorOnly");
      default:
        return null;
    }
  };

  const regionTabs =
    area.type === "region"
      ? [
          { value: area.region.filterRegion, label: seoContext.areaLabel },
        ]
      : [
          { value: "all", label: seoContext.areaLabel },
        ];

  return (
    <PlaceListingLayout
      title={seoContext.pageTitle}
      subtitle={seoContext.subtitle}
      searchIntent={t("restaurants.districtPage.searchIntent", { district: seoContext.areaLabel })}
      searchIntentClassName="restaurants-search-intent"
      trustBadge={t("restaurants.verifiedPanelTitle")}
      searchPlaceholder={t("restaurants.searchPlaceholder")}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterByRegionLabel={t("restaurants.filterByRegion")}
      filtersLabel={t("restaurants.filtersLabel")}
      regions={regionTabs}
      selectedRegion={regionTabs[0].value}
      onRegionChange={() => {}}
      policyFilters={[
        {
          id: "indoor",
          label: t("restaurant.petAccessArea.indoorAllowed"),
          active: indoorAllowed,
          onToggle: () => setIndoorAllowed((v) => !v),
        },
        {
          id: "walkin",
          label: t("restaurants.filterWalkIn"),
          active: walkInAllowed,
          onToggle: () => setWalkInAllowed((v) => !v),
        },
      ]}
      activeFilterLabels={[
        ...(indoorAllowed ? [t("restaurant.petAccessArea.indoorAllowed")] : []),
        ...(walkInAllowed ? [t("restaurants.filterWalkIn")] : []),
      ]}
      hasActiveFilters={indoorAllowed || walkInAllowed}
      onClearFilters={() => {
        setIndoorAllowed(false);
        setWalkInAllowed(false);
        setSearchQuery("");
      }}
      clearFiltersLabel={t("restaurants.clearFilters")}
      isLoading={isLoading}
      error={error}
      errorTitle={t("restaurants.error")}
      errorSubtitle={t("restaurants.errorSubtitle")}
      resultCount={areaRestaurants.length}
      hasMoreToLoad={hasNextPage}
      partialEmptyMessage={t("restaurants.districtPage.noResults", { district: seoContext.areaLabel })}
      partialEmptyHint={t("restaurants.searchingMore")}
      resultsCountLabel=""
      noResults={t("restaurants.districtPage.noResults", { district: seoContext.areaLabel })}
      noResultsHint={t("restaurants.districtPage.noResultsHint", { district: seoContext.areaLabel })}
      suggestPlaceCategory="restaurant"
      listAriaLabel={t("restaurants.districtPage.listAriaLabel", { district: seoContext.areaLabel })}
      ctaTitle={t("restaurants.ctaTitle")}
      ctaDescription={t("restaurants.ctaDescription")}
      directQuestion={t("restaurants.districtPage.directQuestion", { district: seoContext.areaLabel })}
      directAnswer={t("restaurants.districtPage.directAnswer", {
        district: seoContext.areaLabel,
        count: areaRestaurants.length,
        indoorCount,
        walkInCount,
      })}
      faqItems={faqItems}
      faqTitle={t("restaurants.districtPage.faqTitle", { district: seoContext.areaLabel })}
      faqHidden={false}
      listFooterContent={
        <RestaurantListInfiniteLoader
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      }
      belowListContent={
        <AreaSeoBlock
            areaLabel={seoContext.areaLabel}
            count={areaRestaurants.length}
            indoorCount={indoorCount}
            walkInCount={walkInCount}
            fehdRegion={fehdRegion}
            fehdDistrict={fehdDistrict}
            currentSlug={area.type === "district" ? area.district.slug : area.region.slug}
            showFehd={areaRestaurants.length < 5}
        />
      }
    >
      <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {areaRestaurants.map((restaurant) => (
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

interface AreaSeoBlockProps {
  areaLabel: string;
  count: number;
  indoorCount: number;
  walkInCount: number;
  fehdRegion?: string;
  fehdDistrict?: string;
  currentSlug?: string;
  showFehd: boolean;
}

function AreaSeoBlock({
  areaLabel,
  count,
  indoorCount,
  walkInCount,
  fehdRegion,
  fehdDistrict,
  currentSlug,
  showFehd,
}: AreaSeoBlockProps) {
  const { t } = useTranslation();

  return (
    <div className="restaurants-area-seo mt-10 space-y-8 border-t border-border pt-8">
      <section>
        <h2 className="text-lg font-semibold">
          {t("restaurants.districtPage.statsTitle", { district: areaLabel })}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t("restaurants.districtPage.statsBody", {
            district: areaLabel,
            count,
            indoorCount,
            walkInCount,
          })}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t("restaurants.districtPage.fehdCompare")}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/restaurants" className="text-primary underline-offset-4 hover:underline">
            {t("restaurants.districtPage.hubLink")}
          </Link>
          <Link
            to="/hk-fehd-pet-friendly-restaurants-1000-list"
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("restaurants.districtPage.fehdLink")}
          </Link>
          <Link
            to="/pet-friendly-restaurants/districts"
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("restaurants.districtPage.allDistricts")}
          </Link>
        </div>
      </section>

      {showFehd && fehdRegion ? (
        <FehdPetFriendlyDirectory defaultRegion={fehdRegion} defaultDistrict={fehdDistrict} />
      ) : null}

      <RestaurantDistrictLinks currentSlug={currentSlug} compact showCounts={false} />
    </div>
  );
}

export default RestaurantsByArea;
