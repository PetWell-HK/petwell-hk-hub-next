export interface RestaurantTag {
  slug: string;
  nameEn: string;
  nameZh: string;
}

export interface RestaurantExternalMetadata {
  source?: string;
  sourceSlug?: string;
  sourceUrl?: string;
  importedAt?: string;
  types?: RestaurantTag[];
  cuisines?: RestaurantTag[];
  priceRange?: string | null;
  propertyType?: string | null;
  fehdLicenseStatus?: string | null;
  status?: string | null;
  petAreaRaw?: string | null;
  ratings?: {
    google?: { score?: number | null; count?: number | null };
    openrice?: { score?: number | null; count?: number | null };
  };
  amenities?: Record<string, boolean | null | undefined>;
  petPolicyExtras?: {
    carrierStrollerRequired?: boolean | null;
    extraCleaningFee?: boolean | null;
    cleaningFeeAmount?: string | null;
  };
  aiSummary?: { en?: string | null; zh?: string | null };
  aiSnippet?: { en?: string | null; zh?: string | null };
  instagram?: { handle?: string; followerCount?: number | null };
  openriceBookingUrl?: string | null;
  petsonaGrade?: string | null;
  /** Partner-selected dish style slugs (empty / omit = none). */
  dishStyles?: string[] | null;
}

export type RestaurantAmenityKey =
  | 'waterBowl'
  | 'dogMenu'
  | 'petTreats'
  | 'groomingServices'
  | 'petStore'
  | 'sanitationKits'
  | 'photoArea'
  | 'petFirstAidKit'
  | 'employeePetTraining'
  | 'nutritionLabelsProvided';
