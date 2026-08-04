import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductReviewRatingBadgeProps = {
  avgRating?: number | null;
  numReviews?: number;
  className?: string;
  size?: "sm" | "md";
};

export default function ProductReviewRatingBadge({
  avgRating,
  numReviews = 0,
  className,
  size = "sm",
}: ProductReviewRatingBadgeProps) {
  if (!numReviews || !avgRating) return null;

  const textSize = size === "sm" ? "text-[11px]" : "text-[12px]";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div className={cn("inline-flex items-center gap-1 text-amber-600", textSize, className)}>
      <Star className={cn(iconSize, "fill-amber-400 text-amber-400")} />
      <span className="font-semibold tabular-nums">{avgRating.toFixed(1)}</span>
      <span className="text-muted-foreground">({numReviews})</span>
    </div>
  );
}
