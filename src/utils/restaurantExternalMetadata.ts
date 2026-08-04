import type {
  RestaurantAmenityKey,
  RestaurantExternalMetadata,
  RestaurantTag,
} from '@/types/restaurantExternalMetadata';

export type { RestaurantExternalMetadata, RestaurantTag, RestaurantAmenityKey };

export function parseRestaurantExternalMetadata(
  raw: unknown,
): RestaurantExternalMetadata | null {
  if (raw == null || raw === '') return null;

  let value: unknown = raw;
  for (let depth = 0; depth < 3; depth += 1) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      try {
        value = JSON.parse(trimmed);
      } catch {
        return null;
      }
      continue;
    }
    break;
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as RestaurantExternalMetadata;
  }
  return null;
}

export function getLocalizedTags(
  items: RestaurantTag[] | undefined,
  lang: 'zh' | 'en',
): string[] {
  if (!items?.length) return [];
  return items
    .map((item) => (lang === 'en' ? item.nameEn || item.nameZh : item.nameZh || item.nameEn) || item.slug)
    .filter(Boolean);
}

export function formatTagList(
  items: RestaurantTag[] | undefined,
  lang: 'zh' | 'en',
): string {
  return getLocalizedTags(items, lang).join(' · ');
}

export const AMENITY_I18N_KEYS: Record<RestaurantAmenityKey, string> = {
  waterBowl: 'restaurant.import.amenities.waterBowl',
  dogMenu: 'restaurant.import.amenities.dogMenu',
  petTreats: 'restaurant.import.amenities.petTreats',
  groomingServices: 'restaurant.import.amenities.groomingServices',
  petStore: 'restaurant.import.amenities.petStore',
  sanitationKits: 'restaurant.import.amenities.sanitationKits',
  photoArea: 'restaurant.import.amenities.photoArea',
  petFirstAidKit: 'restaurant.import.amenities.petFirstAidKit',
  employeePetTraining: 'restaurant.import.amenities.employeePetTraining',
  nutritionLabelsProvided: 'restaurant.import.amenities.nutritionLabelsProvided',
};

export function getActiveAmenities(
  meta: RestaurantExternalMetadata | null | undefined,
): RestaurantAmenityKey[] {
  if (!meta?.amenities) return [];
  return (Object.keys(AMENITY_I18N_KEYS) as RestaurantAmenityKey[]).filter(
    (key) => meta.amenities?.[key] === true,
  );
}

export function getLocalizedAiText(
  meta: RestaurantExternalMetadata | null | undefined,
  lang: 'zh' | 'en',
): string | null {
  if (!meta) return null;
  const snippet = lang === 'en' ? meta.aiSnippet?.en : meta.aiSnippet?.zh;
  const summary = lang === 'en' ? meta.aiSummary?.en : meta.aiSummary?.zh;
  const text = (snippet || summary || '').trim();
  return text || null;
}

export function isFehdLicensed(
  metaOrStatus: RestaurantExternalMetadata | string | null | undefined,
): boolean {
  const status =
    metaOrStatus == null || typeof metaOrStatus === 'string'
      ? metaOrStatus
      : (metaOrStatus.fehdLicenseStatus ??
        (metaOrStatus as Record<string, unknown>).fehd_license_status);

  if (typeof status !== 'string') return false;

  const normalized = status.trim().toLowerCase();
  return normalized === 'yes' || normalized === 'y' || normalized === 'true';
}

export function isRestaurantFehdLicensed(restaurant: {
  fehdLicensed?: boolean;
  externalMetadata?: RestaurantExternalMetadata | null;
}): boolean {
  if (restaurant.fehdLicensed === true) return true;
  return isFehdLicensed(restaurant.externalMetadata);
}

function isOpenRiceHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === 'openrice.com' ||
    host.endsWith('.openrice.com') ||
    host === 'openrice.com.hk' ||
    host.endsWith('.openrice.com.hk')
  );
}

export function isOpenRiceUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;

  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return isOpenRiceHostname(new URL(withProtocol).hostname);
  } catch {
    return /openrice\.com(\.hk)?/i.test(url);
  }
}

export function getRestaurantWebsiteUrl(website: string | null | undefined): string | null {
  if (!website?.trim()) return null;
  return isOpenRiceUrl(website) ? null : website;
}
