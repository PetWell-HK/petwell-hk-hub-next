import { Banknote } from 'lucide-react';
import { GoogleLogo } from '@/components/brand/PlatformLogos';
import type { RestaurantExternalMetadata } from '@/types/restaurantExternalMetadata';

interface RestaurantRatingPillsProps {
  metadata: RestaurantExternalMetadata | null | undefined;
  className?: string;
}

export function RestaurantRatingPills({ metadata, className }: RestaurantRatingPillsProps) {
  if (!metadata) return null;

  const google = metadata.ratings?.google;
  const hasQuickFacts = metadata.priceRange || google?.score != null;

  if (!hasQuickFacts) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      {metadata.priceRange && (
        <span className="restaurant-rating-pill text-foreground">
          <Banknote className="h-3.5 w-3.5 text-primary" aria-hidden />
          {metadata.priceRange}
        </span>
      )}
      {google?.score != null && (
        <span className="restaurant-rating-pill text-foreground">
          <GoogleLogo className="h-3.5 w-3.5 shrink-0" />
          {google.score}
          {google.count != null && (
            <span className="font-normal text-muted-foreground">({google.count})</span>
          )}
        </span>
      )}
    </div>
  );
}
