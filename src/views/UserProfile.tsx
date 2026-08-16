"use client";

import { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader2, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserReviewList from "@/components/UserReviewList";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { fetchPublicClient, fetchUserReviews } from "@/services/userReviewApi";
import type { UserReviewType } from "@/types/userReview";
import { resolveProfileImageUrl } from "@/utils/reviewDisplay";
import { cn } from "@/lib/utils";

const REVIEW_TYPES: UserReviewType[] = [
  "clinic",
  "salon",
  "lodging",
  "restaurant",
  "product",
];

type FilterKey = "all" | UserReviewType;

const UserProfile = () => {
  const { userId = "" } = useParams();
  const { t, i18n } = useTranslation();
  const { userInfo } = useAuth();
  const [filter, setFilter] = useState<FilterKey>("all");

  const isOwnProfile = Boolean(userId && userInfo?.userId && userId === userInfo.userId);

  const {
    data: client,
    isLoading: loadingClient,
    isError: clientError,
  } = useQuery({
    queryKey: ["publicClient", userId],
    queryFn: () => fetchPublicClient(userId),
    enabled: Boolean(userId) && !isOwnProfile,
  });

  const {
    data: reviews = [],
    isLoading: loadingReviews,
    isError: reviewsError,
  } = useQuery({
    queryKey: ["userReviews", userId, false, i18n.language],
    queryFn: () => fetchUserReviews(userId, { includeAnonymous: false, language: i18n.language }),
    enabled: Boolean(userId) && !isOwnProfile,
  });

  const displayName =
    client?.displayName?.trim() ||
    client?.firstName ||
    t("userReviews.unknownUser");
  const avatarUrl = resolveProfileImageUrl(client?.profileImage);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, review) => acc + (review.totalRating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

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
    if (filter === "all") return reviews;
    return reviews.filter((review) => review.reviewType === filter);
  }, [filter, reviews]);

  useSEO({
    title: `${displayName} | PetWell`,
    description: t("userReviews.publicSeoDescription"),
    canonicalUrl: `https://petwellhk.com/users/${userId}`,
  });

  if (isOwnProfile) {
    return <Navigate to="/account" replace />;
  }

  const loading = loadingClient || loadingReviews;
  const loadFailed = !loading && clientError && reviewsError;
  const showFilters = !loading && !loadFailed && activeTypes.length > 1;

  return (
    <div className="member-profile-page flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="member-profile-hero">
          <div className="container mx-auto px-4 py-8 md:py-10">
            <div className="member-profile-shell member-profile-hero__inner">
              <div className="member-profile-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span aria-hidden>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="member-profile-identity min-w-0 flex-1">
                <p className="member-profile-eyebrow">{t("userReviews.memberBadge")}</p>
                <h1 className="member-profile-name">{displayName}</h1>
                {!loading && !loadFailed ? (
                  <p className="member-profile-meta">
                    <span>{t("userReviews.reviewsCount", { count: reviews.length })}</span>
                    {avgRating != null ? (
                      <>
                        <span className="member-profile-meta__sep" aria-hidden>
                          ·
                        </span>
                        <span className="member-profile-meta__rating">
                          <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                          {t("userReviews.avgRating", { rating: avgRating.toFixed(1) })}
                        </span>
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-6 md:py-8">
          <div className="member-profile-shell">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t("userReviews.loading")}
              </div>
            ) : loadFailed ? (
              <div className="member-profile-empty">{t("userReviews.loadFailed")}</div>
            ) : (
              <>
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
                      className={cn(
                        "member-profile-filter",
                        filter === "all" && "member-profile-filter--active",
                      )}
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

                <UserReviewList
                  reviews={filteredReviews}
                  variant="journal"
                  emptyMessage={
                    filter === "all"
                      ? t("userReviews.publicEmpty")
                      : t("userReviews.emptyFiltered")
                  }
                />
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
