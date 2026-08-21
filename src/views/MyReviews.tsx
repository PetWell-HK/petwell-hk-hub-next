"use client";

import { useEffect, useMemo, useState } from "react";
import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import { Loader2, Search } from "lucide-react";
import AccountHomeShell from "@/components/account/AccountHomeShell";
import UserReviewList from "@/components/UserReviewList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import { useMyReviews } from "@/hooks/useMyReviews";
import type { UserReviewType } from "@/types/userReview";
import { cn } from "@/lib/utils";

const REVIEW_TYPES: UserReviewType[] = [
  "clinic",
  "salon",
  "lodging",
  "restaurant",
  "product",
];

type FilterKey = "all" | UserReviewType;

const MyReviews = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { openPanel } = useAuthPanel();
  const { data: reviews = [], isLoading } = useMyReviews();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");


  useEffect(() => {
    if (isAuthenticated === false) {
      openPanel("LANDING");
    }
  }, [isAuthenticated, openPanel]);

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<UserReviewType, number>> = {};
    for (const review of reviews) {
      counts[review.reviewType] = (counts[review.reviewType] || 0) + 1;
    }
    return counts;
  }, [reviews]);

  const activeTypes = useMemo(
    () => REVIEW_TYPES.filter((type) => (typeCounts[type] || 0) > 0),
    [typeCounts],
  );

  const filteredReviews = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return reviews.filter((review) => {
      if (filter !== "all" && review.reviewType !== filter) return false;
      if (!needle) return true;
      const haystack = [review.placeName, review.title, review.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [filter, query, reviews]);

  const showFilters = reviews.length > 0 && activeTypes.length > 1;
  const hasQuery = query.trim().length > 0;
  const emptyAll = reviews.length === 0;
  const emptyFiltered = !emptyAll && filteredReviews.length === 0;

  return (
    <AccountHomeShell tab="reviews">
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t("userReviews.loading")}
        </div>
      ) : emptyAll ? (
        <div className="account-home-empty account-home-reveal">
          <h3>{t("userReviews.myEmptyTitle")}</h3>
          <p>{t("userReviews.myEmptyBody")}</p>
          <div className="account-home-empty__actions">
            <Button asChild>
              <AppLink href="/restaurants">{t("userReviews.emptyCtaRestaurants")}</AppLink>
            </Button>
            <Button variant="outline" asChild>
              <AppLink href="/clinics">{t("userReviews.emptyCtaClinics")}</AppLink>
            </Button>
          </div>
        </div>
      ) : (
        <div className="account-home-reveal">
          <div className="account-home-search">
            <Search aria-hidden />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("userReviews.searchPlaceholder")}
              aria-label={t("userReviews.searchPlaceholder")}
            />
          </div>

          {showFilters ? (
            <div
              className="member-profile-filters"
              role="tablist"
              aria-label={t("userReviews.filterLabel")}
            >
              <button
                type="button"
                role="tab"
                aria-selected={filter === "all"}
                className={cn("member-profile-filter", filter === "all" && "member-profile-filter--active")}
                onClick={() => setFilter("all")}
              >
                {t("userReviews.filterAll")}
                <span className="member-profile-filter__count">{reviews.length}</span>
              </button>
              {activeTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={filter === type}
                  className={cn(
                    "member-profile-filter",
                    filter === type && "member-profile-filter--active",
                  )}
                  onClick={() => setFilter(type)}
                >
                  {t(`userReviews.types.${type}`)}
                  <span className="member-profile-filter__count">{typeCounts[type]}</span>
                </button>
              ))}
            </div>
          ) : null}

          {emptyFiltered ? (
            <div className="account-home-empty">
              <p>{hasQuery || filter !== "all" ? t("userReviews.emptyFiltered") : t("userReviews.myEmpty")}</p>
            </div>
          ) : (
            <UserReviewList reviews={filteredReviews} variant="journal" showAnonymousBadge />
          )}
        </div>
      )}
    </AccountHomeShell>
  );
};

export default MyReviews;
