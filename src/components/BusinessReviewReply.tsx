import { format } from "date-fns";
import { BadgeCheck, Store } from "lucide-react";

type BusinessReviewReplyProps = {
  reply: string;
  repliedAt?: string | null;
  /** Display name of the place — makes the reply clearly from the business. */
  placeName?: string | null;
  /** Fallback label when placeName is missing. */
  label: string;
  /** e.g. "Reply from {{placeName}}" */
  fromLabel?: string;
  /** Short badge, e.g. "Official" */
  officialBadge?: string;
  lang: "zh" | "en";
};

/** Official partner / business reply under a place review. */
export function BusinessReviewReply({
  reply,
  repliedAt,
  placeName,
  label,
  fromLabel,
  officialBadge,
  lang,
}: BusinessReviewReplyProps) {
  const text = reply.trim();
  if (!text) return null;

  const trimmedPlace = placeName?.trim() || "";
  const title =
    trimmedPlace && fromLabel
      ? fromLabel.replace("{{placeName}}", trimmedPlace)
      : trimmedPlace
        ? lang === "en"
          ? `Reply from ${trimmedPlace}`
          : `來自「${trimmedPlace}」的回覆`
        : label;

  const badge =
    officialBadge || (lang === "en" ? "Official" : "店家官方");

  return (
    <aside
      className="restaurant-review-partner-reply mt-3"
      aria-label={title}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary"
          aria-hidden="true"
        >
          <Store className="h-4 w-4" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-semibold leading-snug text-foreground">
              {title}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-primary">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              {badge}
            </span>
          </div>
          {repliedAt ? (
            <time
              className="mt-0.5 block text-xs text-muted-foreground"
              dateTime={repliedAt}
            >
              {format(
                new Date(repliedAt),
                lang === "en" ? "MMM d, yyyy" : "yyyy年MM月dd日",
              )}
            </time>
          ) : null}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {text}
          </p>
        </div>
      </div>
    </aside>
  );
}
