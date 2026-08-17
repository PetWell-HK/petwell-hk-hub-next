import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import DirectAnswerBox from "@/components/DirectAnswerBox";
import PlaceReportModal from "@/components/PlaceReportModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import DiscoverPlaceTabs from "@/components/DiscoverPlaceTabs";
import { AppDownloadCTA } from "@/components/AppDownloadCTA";
import { cn } from "@/lib/utils";
import type { WebSuggestPlaceCategory } from "@/services/reportService";

export interface PlaceListingFilter {
  id: string;
  label: string;
  active: boolean;
  onToggle: () => void;
}

interface PlaceListingFAQItem {
  question: string;
  answer: string;
}

interface PlaceListingLayoutProps {
  title: string;
  subtitle: string;
  description?: string;
  searchIntent?: string;
  searchIntentClassName?: string;
  trustBadge?: string;
  searchPlaceholder: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterByRegionLabel: string;
  filtersLabel: string;
  regions: Array<{ value: string; label: string }>;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  policyFilters?: PlaceListingFilter[];
  activeFilterLabels: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  clearFiltersLabel: string;
  isLoading: boolean;
  error: unknown;
  errorTitle: string;
  errorSubtitle: string;
  resultCount: number;
  /** When true, show load-more UI even if resultCount is 0 (more pages may match filters). */
  hasMoreToLoad?: boolean;
  partialEmptyMessage?: string;
  partialEmptyHint?: string;
  resultsCountLabel?: string;
  resultsNote?: string;
  noResults: string;
  noResultsHint: string;
  listAriaLabel: string;
  ctaTitle: string;
  ctaDescription: string;
  directQuestion?: string;
  directAnswer?: string;
  directAnswerHidden?: boolean;
  faqItems?: PlaceListingFAQItem[];
  faqTitle?: string;
  faqHidden?: boolean;
  belowListContent?: ReactNode;
  listFooterContent?: ReactNode;
  /** When set, empty state shows a CTA to suggest a missing place of this category. */
  suggestPlaceCategory?: WebSuggestPlaceCategory;
  /** "find" puts the list first (default). Extra copy stays in `.seo-hidden` for crawlers. */
  heroMode?: "full" | "find";
  children: ReactNode;
}

const PlaceListingLayout = ({
  title,
  subtitle,
  description,
  searchIntent,
  searchIntentClassName,
  trustBadge,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  filterByRegionLabel,
  filtersLabel,
  regions,
  selectedRegion,
  onRegionChange,
  policyFilters = [],
  activeFilterLabels,
  hasActiveFilters,
  onClearFilters,
  clearFiltersLabel,
  isLoading,
  error,
  errorTitle,
  errorSubtitle,
  resultCount,
  hasMoreToLoad = false,
  partialEmptyMessage,
  partialEmptyHint,
  resultsCountLabel,
  resultsNote,
  noResults,
  noResultsHint,
  listAriaLabel,
  ctaTitle,
  ctaDescription,
  directQuestion,
  directAnswer,
  directAnswerHidden = true,
  faqItems,
  faqTitle,
  faqHidden = true,
  belowListContent,
  listFooterContent,
  suggestPlaceCategory,
  heroMode = "find",
  children,
}: PlaceListingLayoutProps) => {
  const { t } = useTranslation();
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const showResults = !isLoading && !error && resultCount > 0;
  const showPartialEmpty = !isLoading && !error && resultCount === 0 && hasMoreToLoad;
  const showEmpty = !isLoading && !error && resultCount === 0 && !hasMoreToLoad;
  const isFindHero = heroMode === "find";
  const showHeroCount = Boolean(resultsCountLabel) && !isLoading && !error;

  const suggestCta = suggestPlaceCategory ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-5"
      onClick={() => setIsSuggestModalOpen(true)}
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      {t("report.suggestEmptyCta")}
    </Button>
  ) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="place-listing-page flex-1 pb-14 md:pb-16">
        <div className="container mx-auto max-w-6xl px-4">
          <header className={cn("hero-summary", isFindHero ? "pt-4 md:pt-5" : "pt-8 md:pt-10")}>
            {isFindHero ? (
              <div className="flex items-end justify-between gap-3">
                <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {title}
                </h1>
                {showHeroCount ? (
                  <p className="mb-0.5 shrink-0 text-xs tabular-nums text-muted-foreground md:text-sm">
                    {resultsCountLabel}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {title}
                  </h1>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                    {subtitle}
                  </p>
                  {description ? (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80 md:text-sm">
                      {description}
                    </p>
                  ) : null}
                  {searchIntent ? (
                    <p
                      className={cn(
                        "mt-2 text-xs leading-relaxed text-muted-foreground/80 md:text-sm",
                        searchIntentClassName,
                      )}
                    >
                      {searchIntent}
                    </p>
                  ) : null}
                </div>
                {trustBadge ? (
                  <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span>{trustBadge}</span>
                  </div>
                ) : null}
              </div>
            )}

            {isFindHero ? (
              <div className="seo-hidden">
                <p>{subtitle}</p>
                {description ? <p>{description}</p> : null}
                {searchIntent ? (
                  <p className={searchIntentClassName}>{searchIntent}</p>
                ) : null}
                {trustBadge ? <p>{trustBadge}</p> : null}
              </div>
            ) : null}

            <DiscoverPlaceTabs
              className={isFindHero ? "discover-place-tabs-compact mt-3" : "mt-6"}
              compact={isFindHero}
            />
          </header>

          <div
            className={cn(
              "place-listing-toolbar sticky top-[var(--header-height)] z-20 -mx-4 border-b border-border bg-background px-4",
              isFindHero ? "place-listing-toolbar-compact py-2.5" : "py-4",
            )}
          >
            <div className="place-listing-search mx-auto max-w-6xl">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className={cn(
                    "rounded-lg border-border bg-background pl-10 pr-4 text-[15px] shadow-none",
                    isFindHero ? "h-10" : "h-11",
                  )}
                  aria-label={searchPlaceholder}
                />
              </div>
            </div>

            <div
              className={cn(
                "mx-auto max-w-6xl",
                isFindHero
                  ? "mt-2 flex items-center gap-2 overflow-x-auto scrollbar-none"
                  : "mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
              )}
            >
              <nav
                aria-label={filterByRegionLabel}
                className="flex shrink-0 gap-0.5"
              >
                {regions.map((region) => (
                  <button
                    key={region.value}
                    type="button"
                    onClick={() => onRegionChange(region.value)}
                    data-active={selectedRegion === region.value}
                    className="place-listing-region-tab shrink-0"
                    aria-pressed={selectedRegion === region.value}
                  >
                    {region.label}
                  </button>
                ))}
              </nav>

              {(policyFilters.length > 0 || hasActiveFilters) && (
                <div className="flex shrink-0 items-center gap-1.5">
                  {isFindHero ? (
                    <span className="h-4 w-px shrink-0 bg-border" aria-hidden="true" />
                  ) : null}
                  {policyFilters.length > 0 && !isFindHero && (
                    <span className="mr-1 hidden items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:inline-flex">
                      <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
                      {filtersLabel}
                    </span>
                  )}
                  {policyFilters.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={filter.onToggle}
                      aria-pressed={filter.active}
                      className={cn(
                        "place-listing-filter-chip",
                        filter.active && "place-listing-filter-chip-active",
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                      {clearFiltersLabel}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={isFindHero ? "pt-4" : "pt-8"}>
            {isLoading && (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="py-24 text-center">
                <p className="text-base font-medium text-destructive">{errorTitle}</p>
                <p className="mt-2 text-sm text-muted-foreground">{errorSubtitle}</p>
              </div>
            )}

            {showPartialEmpty && (
              <>
                <div className="py-16 text-center">
                  <p className="text-base font-medium text-foreground">
                    {partialEmptyMessage ?? noResults}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {partialEmptyHint ?? noResultsHint}
                  </p>
                  {suggestCta}
                </div>
                {listFooterContent}
              </>
            )}

            {showEmpty && (
              <>
                <div className="py-24 text-center">
                  <p className="text-base font-medium text-foreground">{noResults}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{noResultsHint}</p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-5">
                      {clearFiltersLabel}
                    </Button>
                  )}
                  {suggestCta}
                </div>
                {belowListContent}
                {directQuestion && directAnswer ? (
                  <DirectAnswerBox
                    question={directQuestion}
                    answer={directAnswer}
                    className="mt-10 max-w-2xl"
                    hidden={directAnswerHidden}
                  />
                ) : null}
                {faqItems && faqTitle ? (
                  <FAQSection
                    items={faqItems}
                    title={faqTitle}
                    className="mt-8"
                    hidden={faqHidden}
                  />
                ) : null}
              </>
            )}

            {showResults && (
              <>
                {(isFindHero
                  ? Boolean(resultsNote)
                  : Boolean(resultsCountLabel || resultsNote || activeFilterLabels.length > 0)) && (
                <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", isFindHero ? "mb-3" : "mb-6")}>
                  {(!isFindHero && (resultsCountLabel || resultsNote)) || (isFindHero && resultsNote) ? (
                    <div className="min-w-0">
                      {!isFindHero && resultsCountLabel ? (
                        <p className="text-sm tabular-nums text-muted-foreground">
                          {resultsCountLabel}
                        </p>
                      ) : null}
                      {resultsNote ? (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {resultsNote}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {!isFindHero && activeFilterLabels.length > 0 && (
                    <div className={`flex flex-wrap gap-1.5${resultsCountLabel ? "" : " sm:ml-auto"}`}>
                      {activeFilterLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                )}

                <section aria-label={listAriaLabel}>{children}</section>

                {listFooterContent}

                <section className="mt-14 border-t border-border pt-10">
                  <Card className="border border-border bg-background p-6 shadow-none md:p-8">
                    <AppDownloadCTA title={ctaTitle} description={ctaDescription} />
                  </Card>
                </section>

                {directQuestion && directAnswer ? (
                  <DirectAnswerBox
                    question={directQuestion}
                    answer={directAnswer}
                    className="mt-10 max-w-2xl"
                    hidden={directAnswerHidden}
                  />
                ) : null}

                {faqItems && faqTitle ? (
                  <FAQSection
                    items={faqItems}
                    title={faqTitle}
                    className="mt-8"
                    hidden={faqHidden}
                  />
                ) : null}

                {belowListContent}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {suggestPlaceCategory ? (
        <PlaceReportModal
          open={isSuggestModalOpen}
          onOpenChange={setIsSuggestModalOpen}
          defaultMode="suggest"
          defaultCategory={suggestPlaceCategory}
        />
      ) : null}
    </div>
  );
};

export default PlaceListingLayout;
