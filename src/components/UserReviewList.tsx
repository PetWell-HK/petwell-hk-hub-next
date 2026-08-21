import AppLink from "@/components/AppLink";
import { useTranslation } from "react-i18next";
import { ChevronRight, Star } from "lucide-react";
import { getUserReviewHref } from "@/services/userReviewApi";
import type { UserReviewItem, UserReviewType } from "@/types/userReview";
import { cn } from "@/lib/utils";

type UserReviewListProps = {
  reviews: UserReviewItem[];
  showAnonymousBadge?: boolean;
  emptyMessage?: string;
  variant?: "default" | "journal";
};

function typeLabel(type: UserReviewType, t: (key: string) => string): string {
  switch (type) {
    case "clinic":
      return t("userReviews.types.clinic");
    case "salon":
      return t("userReviews.types.salon");
    case "lodging":
      return t("userReviews.types.lodging");
    case "restaurant":
      return t("userReviews.types.restaurant");
    case "product":
      return t("userReviews.types.product");
    default: {
      const _exhaustive: never = type;
      return String(_exhaustive);
    }
  }
}

function formatDate(value: string | null | undefined, language: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(language.startsWith("zh") ? "zh-HK" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RatingStars({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} / 5`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < clamped ? "fill-primary text-primary" : "text-muted",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function UserReviewList({
  reviews,
  showAnonymousBadge = false,
  emptyMessage,
  variant = "default",
}: UserReviewListProps) {
  const { t, i18n } = useTranslation();

  if (reviews.length === 0) {
    return (
      <div
        className={cn(
          variant === "journal"
            ? "member-profile-empty"
            : "rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground",
        )}
      >
        {emptyMessage || t("userReviews.empty")}
      </div>
    );
  }

  if (variant === "journal") {
    return (
      <ul className="member-review-list">
        {reviews.map((review) => {
          const ratingValue =
            typeof review.totalRating === "number"
              ? Math.round(review.totalRating * 10) / 10
              : 0;
          const title = review.title?.trim() || "";
          const description = review.description?.trim() || "";
          const showSeparateTitle =
            Boolean(title) &&
            Boolean(description) &&
            title !== description &&
            !description.startsWith(title);
          const excerpt = showSeparateTitle ? description : description || title;

          return (
            <li key={`${review.reviewType}-${review.id}`}>
              <AppLink href={getUserReviewHref(review)} className="member-review-row">
                <div className="member-review-row__top">
                  <div className="min-w-0">
                    <h3 className="member-review-row__place">
                      {review.placeName || typeLabel(review.reviewType, t)}
                    </h3>
                    <p className="member-review-row__meta">
                      <span>{typeLabel(review.reviewType, t)}</span>
                      {review.createdAt ? (
                        <>
                          <span aria-hidden>·</span>
                          <time dateTime={review.createdAt}>
                            {formatDate(review.createdAt, i18n.language)}
                          </time>
                        </>
                      ) : null}
                      {showAnonymousBadge && review.anonymous ? (
                        <>
                          <span aria-hidden>·</span>
                          <span>{t("userReviews.anonymousBadge")}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="member-review-row__rating">
                    <span className="member-review-row__score">{ratingValue.toFixed(1)}</span>
                    <RatingStars rating={review.totalRating} />
                  </div>
                </div>

                {showSeparateTitle ? (
                  <p className="member-review-row__title">{title}</p>
                ) : null}

                {excerpt ? <p className="member-review-row__excerpt">{excerpt}</p> : null}

                <span className="member-review-row__cta">
                  {t("userReviews.viewPlace")}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </AppLink>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => {
        const rating = Math.max(0, Math.min(5, Math.round(review.totalRating || 0)));
        return (
          <li key={`${review.reviewType}-${review.id}`}>
            <AppLink
              href={getUserReviewHref(review)}
              className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {typeLabel(review.reviewType, t)}
                </span>
                <div className="flex items-center gap-0.5" aria-label={`${review.totalRating} / 5`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < rating ? "fill-primary text-primary" : "text-muted",
                      )}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {review.placeName || typeLabel(review.reviewType, t)}
              </h3>
              {review.title ? (
                <p className="mt-1 text-sm font-medium text-foreground/90">{review.title}</p>
              ) : null}
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {review.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {review.createdAt ? (
                  <time dateTime={review.createdAt}>{formatDate(review.createdAt, i18n.language)}</time>
                ) : null}
                {showAnonymousBadge && review.anonymous ? (
                  <span>{t("userReviews.anonymousBadge")}</span>
                ) : null}
              </div>
            </AppLink>
          </li>
        );
      })}
    </ul>
  );
}
