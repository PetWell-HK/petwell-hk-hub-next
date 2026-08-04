import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  UtensilsCrossed,
  Banknote,
  Instagram,
  PawPrint,
  Droplets,
  Camera,
  Heart,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GoogleLogo } from '@/components/brand/PlatformLogos';
import { RestaurantRatingPills } from '@/components/restaurant/RestaurantRatingPills';
import type { RestaurantExternalMetadata } from '@/types/restaurantExternalMetadata';
import {
  AMENITY_I18N_KEYS,
  formatTagList,
  getActiveAmenities,
  getLocalizedTags,
} from '@/utils/restaurantExternalMetadata';
import { getLocalizedDishStyles } from '@/utils/dishStyles';

const AMENITY_ICONS: Partial<Record<keyof typeof AMENITY_I18N_KEYS, typeof PawPrint>> = {
  waterBowl: Droplets,
  dogMenu: UtensilsCrossed,
  photoArea: Camera,
  petTreats: Heart,
};

interface RestaurantImportInsightsProps {
  metadata: RestaurantExternalMetadata | null | undefined;
  className?: string;
  variant?: "card" | "inline";
  /** Hide price / Google pills when shown in the page header */
  omitQuickFacts?: boolean;
}

export function RestaurantImportInsights({
  metadata,
  className,
  variant = "card",
  omitQuickFacts = false,
}: RestaurantImportInsightsProps) {
  const { t, i18n } = useTranslation();
  const lang: 'zh' | 'en' = i18n.language === 'en' ? 'en' : 'zh';

  if (!metadata) return null;

  const typeTags = getLocalizedTags(metadata.types, lang);
  const cuisineTags = getLocalizedTags(metadata.cuisines, lang);
  const dishStyleTags = getLocalizedDishStyles(metadata.dishStyles, lang);
  const amenities = getActiveAmenities(metadata);
  const google = metadata.ratings?.google;
  const hasQuickFacts = metadata.priceRange || google?.score;
  const hasTags = typeTags.length > 0 || cuisineTags.length > 0 || dishStyleTags.length > 0;
  const instagramHandle = metadata.instagram?.handle?.replace(/^@/, '');

  if (
    !omitQuickFacts &&
    !hasQuickFacts &&
    !hasTags &&
    amenities.length === 0 &&
    !instagramHandle
  ) {
    return null;
  }

  if (
    omitQuickFacts &&
    !hasTags &&
    amenities.length === 0 &&
    !instagramHandle
  ) {
    return null;
  }

  const quickFacts = (
    <>
      {hasQuickFacts && !omitQuickFacts && variant === "inline" && (
        <RestaurantRatingPills metadata={metadata} />
      )}

      {hasQuickFacts && !omitQuickFacts && variant === "card" && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {metadata.priceRange && (
            <div className="rounded-lg border border-border/60 bg-card/90 px-3 py-2.5">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Banknote className="h-3.5 w-3.5 text-primary" aria-hidden />
                {t('restaurant.import.priceRange')}
              </div>
              <p className="text-sm font-semibold">{metadata.priceRange}</p>
            </div>
          )}
          {google?.score != null && (
            <div className="rounded-lg border border-border/60 bg-card/90 px-3 py-2.5">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <GoogleLogo className="h-3.5 w-3.5 shrink-0" />
                Google
              </div>
              <p className="text-sm font-semibold">
                {google.score}
                {google.count != null && (
                  <span className="ml-1 font-normal text-muted-foreground">({google.count})</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );

  const inlineChips =
    variant === "inline" && (hasTags || amenities.length > 0) ? (
      <div className="flex flex-wrap gap-1.5">
        {typeTags.map((label) => (
          <Badge key={`type-${label}`} variant="secondary" className="rounded-md font-medium">
            {label}
          </Badge>
        ))}
        {cuisineTags.map((label) => (
          <Badge key={`cuisine-${label}`} variant="outline" className="rounded-md text-muted-foreground">
            {label}
          </Badge>
        ))}
        {dishStyleTags.map((label) => (
          <Badge key={`dish-${label}`} variant="outline" className="rounded-md border-primary/30 text-foreground">
            {label}
          </Badge>
        ))}
        {amenities.map((key) => {
          const Icon = AMENITY_ICONS[key] ?? PawPrint;
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium"
            >
              <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
              {t(AMENITY_I18N_KEYS[key])}
            </span>
          );
        })}
      </div>
    ) : null;

  const tagsBlock = hasTags && variant === "card" && (
    <div className="mb-4 space-y-2">
      {typeTags.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('restaurant.import.types')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {typeTags.map((label) => (
              <Badge key={label} variant="secondary" className="rounded-md font-medium">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {cuisineTags.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('restaurant.import.cuisines')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cuisineTags.map((label) => (
              <Badge key={label} variant="outline" className="rounded-md text-muted-foreground">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {dishStyleTags.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('restaurant.import.dishStyles')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dishStyleTags.map((label) => (
              <Badge key={label} variant="outline" className="rounded-md border-primary/30 text-foreground">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const amenitiesBlock = amenities.length > 0 && variant === "card" && (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('restaurant.import.amenitiesTitle')}
      </p>
      <div className="flex flex-wrap gap-2">
        {amenities.map((key) => {
          const Icon = AMENITY_ICONS[key] ?? PawPrint;
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium"
            >
              <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
              {t(AMENITY_I18N_KEYS[key])}
            </span>
          );
        })}
      </div>
    </div>
  );

  const linksBlock = instagramHandle ? (
    <div className="flex flex-wrap gap-2 pt-2">
      <Button asChild variant="outline" size="sm" className="h-8 rounded-full text-xs">
        <a
          href={`https://instagram.com/${instagramHandle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Instagram className="mr-1.5 h-3.5 w-3.5" />
          @{instagramHandle}
        </a>
      </Button>
    </div>
  ) : null;

  if (variant === "inline") {
    return (
      <div className={className}>
        {quickFacts}
        {inlineChips}
        {linksBlock}
      </div>
    );
  }

  return (
    <Card
      className={`relative overflow-hidden border-primary/15 bg-gradient-to-br from-secondary/80 via-card to-secondary/40 p-5 md:p-6 shadow-soft ${className ?? ''}`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl"
        aria-hidden
      />

      <header className="relative mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight">{t('restaurant.import.title')}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('restaurant.import.subtitle')}</p>
        </div>
      </header>

      {quickFacts}
      {tagsBlock}
      {amenitiesBlock}
      {linksBlock}
    </Card>
  );
}

export function getRestaurantListMetaChips(
  metadata: RestaurantExternalMetadata | null | undefined,
  lang: 'zh' | 'en',
): { types: string; priceRange: string | null; googleScore: number | null } {
  return {
    types: formatTagList(metadata?.types, lang),
    priceRange: metadata?.priceRange ?? null,
    googleScore: metadata?.ratings?.google?.score ?? null,
  };
}
