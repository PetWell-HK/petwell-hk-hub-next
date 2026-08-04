import { graphqlQuery } from './graphqlClient';
import { getRegionFromDistrict as getRegionFromDistrictData } from '@/data/hongKongDistricts';
import { parseRestaurantExternalMetadata, isFehdLicensed } from '@/utils/restaurantExternalMetadata';
import { getLocalizedDishStyles } from '@/utils/dishStyles';
import { getRestaurantCombinedRating } from '@/utils/restaurantRating';
import { applyPlaceDistrictSearchVariables, HK_CENTER, normalizePlaceSearchNextToken, runPlaceSearch } from '@/services/placeSearchUtils';
import { isDevListing, shouldIncludeDevListings } from '@/utils/devListings';
import { isEffectivePremium, sortPremiumFirst } from '@/utils/partnerPremium';
import type { RestaurantExternalMetadata } from '@/types/restaurantExternalMetadata';

export type { RestaurantExternalMetadata };

export interface MultiLangString {
  zh: string;
  en: string;
}

export interface AvailableHours {
  mon?: { start: string; end: string };
  tue?: { start: string; end: string };
  wed?: { start: string; end: string };
  thu?: { start: string; end: string };
  fri?: { start: string; end: string };
  sat?: { start: string; end: string };
  sun?: { start: string; end: string };
  otherConditions?: string;
}

export interface RestaurantReservationSettings {
  window?: Partial<
    Record<
      'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
      {
        enabled: boolean;
        /** One or more bookable intervals in a day, e.g. 10:00–11:00 and 15:00–16:00 */
        intervals?: Array<{ open: string; close: string }>;
        /** @deprecated legacy single-interval fields */
        open?: string;
        close?: string;
      }
    >
  >;
  cutoffMinutes?: number;
  /** Max pets a customer may bring on one booking */
  maxPetsPerBooking?: number;
  /** @deprecated use maxPetsPerBooking */
  maxPetsPerSlot?: number;
  /** Spacing between selectable booking start times inside each interval */
  slotMinutes?: number;
  blackoutDates?: string[];
  terms?: string;
  /** @deprecated unused */
  depositThresholdPets?: number;
  quickReplies?: { declines?: string[]; arrivals?: string[] };
  /** @deprecated unused */
  notify?: {
    inApp?: boolean;
    email?: boolean;
    whatsapp?: boolean;
    notifyCustomer?: boolean;
  };
}

export interface ApiRestaurant {
  id: string;
  ownerSub?: string | null;
  name: MultiLangString;
  address: MultiLangString;
  location?: { lat: number; lon: number };
  district: string;
  phoneNo?: string;
  availableHours?: AvailableHours;
  reservationSettings?: RestaurantReservationSettings | string | null;
  coverPhoto?: string;
  gallery?: string[];
  verified?: boolean;
  isDevListing?: boolean;
  petEntryPolicy?: 'WALK_IN_ONLY' | 'RESERVATION_REQUIRED' | 'BOTH' | 'UNKNOWN';
  petAccessArea?: 'INDOOR_ALLOWED' | 'OUTDOOR_ONLY' | 'UNKNOWN';
  petPolicyNotes?: MultiLangString;
  listingAlert?: MultiLangString;
  photoSource?: string;
  website?: string;
  email?: string;
  totalRating?: number;
  combinedRating?: number | null;
  is247?: boolean;
  fehdLicensed?: boolean;
  puppuccino?: boolean;
  partnerPlan?: string | null;
  partnerPlanExpiresAt?: string | null;
  externalMetadata?: RestaurantExternalMetadata | Record<string, unknown> | string | null;
  reviews?: {
    items: Array<{
      id: string;
      reviewerId?: string | null;
      anonymous?: boolean | null;
      title?: string;
      description?: string;
      totalRating?: number;
      fileAttachments?: string[];
      source?: string;
      partnerReply?: string | null;
      partnerReplyAt?: string | null;
      updatedAt: string;
      reviewer?: {
        id?: string | null;
        displayName?: string | null;
        firstName?: string | null;
        profileImage?: string | null;
      } | null;
    }>;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  region: string;
  district: string;
  address: string;
  location?: { lat: number; lon: number };
  phone?: string;
  availableHours?: AvailableHours;
  reservationSettings?: RestaurantReservationSettings | string | null;
  rating?: number;
  image?: string;
  gallery?: string[];
  verified: boolean;
  isDevListing?: boolean;
  petEntryPolicy?: string;
  petAccessArea?: string;
  petPolicyNotes?: string;
  listingAlert?: string;
  website?: string;
  is247?: boolean;
  puppuccino?: boolean;
  fehdLicensed?: boolean;
  externalMetadata?: RestaurantExternalMetadata | null;
  typeLabels?: string;
  priceRange?: string | null;
  googleRating?: number | null;
  partnerPlan?: string | null;
  partnerPlanExpiresAt?: string | null;
  isPremium?: boolean;
}

// Helper to check if verified is truthy
export function isVerified(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || 
    (typeof value === "string" && value.toLowerCase() === "true");
}

// Map district to region
function getRegionFromDistrict(district: string): string {
  return getRegionFromDistrictData(district);
}

// Helper to get localized string with fallback to the other language
function getLocalizedString(multiLang: MultiLangString | undefined, language: string): string {
  if (!multiLang) return '';
  const lang = language === 'en' ? 'en' : 'zh';
  const fallbackLang = lang === 'en' ? 'zh' : 'en';
  return multiLang[lang] || multiLang[fallbackLang] || '';
}

// Transform API restaurant to app restaurant format
function transformRestaurant(apiRestaurant: ApiRestaurant, language: string = 'zh'): Restaurant {
  const lang = language === 'en' ? 'en' : 'zh';
  const externalMetadata = parseRestaurantExternalMetadata(apiRestaurant.externalMetadata);
  const typeLabels = externalMetadata?.types
    ?.map((item) => (lang === 'en' ? item.nameEn || item.nameZh : item.nameZh || item.nameEn) || item.slug)
    .filter(Boolean)
    .join(' · ');
  const dishStyleLabels = getLocalizedDishStyles(externalMetadata?.dishStyles, lang).join(' · ');
  const combinedTypeLabels = [typeLabels, dishStyleLabels].filter(Boolean).join(' · ');

  return {
    id: apiRestaurant.id,
    name: getLocalizedString(apiRestaurant.name, language),
    region: getRegionFromDistrict(apiRestaurant.district),
    district: apiRestaurant.district || '',
    address: getLocalizedString(apiRestaurant.address, language),
    location: apiRestaurant.location,
    phone: apiRestaurant.phoneNo,
    availableHours: apiRestaurant.availableHours,
    reservationSettings: apiRestaurant.reservationSettings,
    rating: getRestaurantCombinedRating({
      totalRating: apiRestaurant.totalRating,
      externalMetadata,
      combinedRating: apiRestaurant.combinedRating,
    }) ?? undefined,
    image: apiRestaurant.coverPhoto || (apiRestaurant.gallery?.[0]),
    gallery: apiRestaurant.gallery,
    verified: isVerified(apiRestaurant.verified),
    isDevListing: isDevListing(apiRestaurant.isDevListing),
    petEntryPolicy: apiRestaurant.petEntryPolicy,
    petAccessArea: apiRestaurant.petAccessArea,
    petPolicyNotes: getLocalizedString(apiRestaurant.petPolicyNotes, language),
    listingAlert: getLocalizedString(apiRestaurant.listingAlert, language) || undefined,
    website: apiRestaurant.website,
    is247: apiRestaurant.is247,
    puppuccino: apiRestaurant.puppuccino === true,
    fehdLicensed: apiRestaurant.fehdLicensed === true || isFehdLicensed(externalMetadata),
    externalMetadata,
    typeLabels: combinedTypeLabels || undefined,
    priceRange: externalMetadata?.priceRange ?? null,
    googleRating: externalMetadata?.ratings?.google?.score ?? null,
    partnerPlan: apiRestaurant.partnerPlan ?? null,
    partnerPlanExpiresAt: apiRestaurant.partnerPlanExpiresAt ?? null,
    isPremium:
      apiRestaurant.partnerPlan === 'PREMIUM' &&
      (!apiRestaurant.partnerPlanExpiresAt ||
        Date.parse(apiRestaurant.partnerPlanExpiresAt) > Date.now()),
  };
}

// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const RESTAURANT_LISTING_FIELDS = `
        id
        name { zh en }
        address { zh en }
        district
        availableHours {
          mon { start end }
          tue { start end }
          wed { start end }
          thu { start end }
          fri { start end }
          sat { start end }
          sun { start end }
          otherConditions
        }
        coverPhoto
        verified
        isDevListing
        petEntryPolicy
        petAccessArea
        totalRating
        combinedRating
        is247
        fehdLicensed
        puppuccino
        externalMetadata
        partnerPlan
        partnerPlanExpiresAt
`;

const LIST_RESTAURANTS_QUERY = `
  query ListRestaurants($limit: Int, $nextToken: String) {
    listRestaurants(limit: $limit, nextToken: $nextToken) {
      items {
${RESTAURANT_LISTING_FIELDS}
      }
      nextToken
    }
  }
`;

const LIST_FEHD_RESTAURANTS_QUERY = `
  query ListFehdRestaurants($limit: Int, $nextToken: String) {
    listRestaurants(
      filter: { fehdLicensed: { eq: true } }
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
${RESTAURANT_LISTING_FIELDS}
      }
      nextToken
    }
  }
`;

const GET_RESTAURANT_QUERY = `
  query GetRestaurant($id: ID!) {
    getRestaurant(id: $id) {
      id
      ownerSub
      name { zh en }
      address { zh en }
      location { lat lon }
      district
      phoneNo
      availableHours {
        mon { start end }
        tue { start end }
        wed { start end }
        thu { start end }
        fri { start end }
        sat { start end }
        sun { start end }
        otherConditions
      }
      reservationSettings
      coverPhoto
      gallery
      verified
      isDevListing
      petEntryPolicy
      petAccessArea
      petPolicyNotes { zh en }
      listingAlert { zh en }
      photoSource
      website
      email
      totalRating
      combinedRating
      is247
      fehdLicensed
      puppuccino
      externalMetadata
      partnerPlan
      partnerPlanExpiresAt
      reviews {
        items {
          id
          reviewerId
          anonymous
          title
          description
          totalRating
          fileAttachments
          source
          partnerReply
          partnerReplyAt
          updatedAt
          reviewer {
            id
            displayName
            firstName
            profileImage
          }
        }
      }
    }
  }
`;

/** Fallback when partnerReply fields are unavailable; keeps reservationSettings. */
const GET_RESTAURANT_QUERY_WITHOUT_PARTNER_REPLY = `
  query GetRestaurant($id: ID!) {
    getRestaurant(id: $id) {
      id
      ownerSub
      name { zh en }
      address { zh en }
      location { lat lon }
      district
      phoneNo
      availableHours {
        mon { start end }
        tue { start end }
        wed { start end }
        thu { start end }
        fri { start end }
        sat { start end }
        sun { start end }
        otherConditions
      }
      reservationSettings
      coverPhoto
      gallery
      verified
      isDevListing
      petEntryPolicy
      petAccessArea
      petPolicyNotes { zh en }
      listingAlert { zh en }
      photoSource
      website
      email
      totalRating
      combinedRating
      is247
      fehdLicensed
      puppuccino
      externalMetadata
      partnerPlan
      partnerPlanExpiresAt
      reviews {
        items {
          id
          title
          description
          totalRating
          fileAttachments
          source
          updatedAt
        }
      }
    }
  }
`;

/** Last-resort fallback for older schemas without reservationSettings. */
const GET_RESTAURANT_QUERY_LEGACY = `
  query GetRestaurant($id: ID!) {
    getRestaurant(id: $id) {
      id
      ownerSub
      name { zh en }
      address { zh en }
      location { lat lon }
      district
      phoneNo
      availableHours {
        mon { start end }
        tue { start end }
        wed { start end }
        thu { start end }
        fri { start end }
        sat { start end }
        sun { start end }
        otherConditions
      }
      coverPhoto
      gallery
      verified
      isDevListing
      petEntryPolicy
      petAccessArea
      petPolicyNotes { zh en }
      listingAlert { zh en }
      photoSource
      website
      email
      totalRating
      combinedRating
      is247
      fehdLicensed
      puppuccino
      externalMetadata
      partnerPlan
      partnerPlanExpiresAt
      reviews {
        items {
          id
          reviewerId
          anonymous
          title
          description
          totalRating
          fileAttachments
          source
          updatedAt
          reviewer {
            id
            displayName
            firstName
            profileImage
          }
        }
      }
    }
  }
`;

export interface FetchRestaurantsOptions {
  region?: string;
  district?: string;
  districts?: string[];
  keyword?: string;
  sortMethod?: 'location' | 'rating-desc';
  is247?: boolean;
  fehdLicensed?: boolean;
  verified?: boolean;
  petAccessArea?: string;
  petEntryPolicy?: 'WALK_IN';
  limit?: number;
  nextToken?: number[];
  /** Use full search fields (e.g. nearby). Listing pages use the lighter query by default. */
  fullFields?: boolean;
}

const RESTAURANT_PAGE_SIZE = 500;
const LIST_PAGE_SIZE = 100;

/** Cards shown per page on restaurant listing pages (fewer = faster initial paint). */
export const RESTAURANTS_LIST_PAGE_SIZE = 12;

/** Server-side search page size — one request instead of paging through the full catalog. */
export const RESTAURANT_SEARCH_PAGE_SIZE = 48;

/** Pool size for home page featured rail (one API call, then shuffle client-side). */
export const HOME_FEATURED_RESTAURANT_FETCH_SIZE = 48;

export { getPlaceSearchNextPageParam as getRestaurantSearchNextPageParam } from '@/services/placeSearchUtils';

export async function fetchRestaurants(
  options: FetchRestaurantsOptions = {},
  language: string = 'zh'
): Promise<{ restaurants: Restaurant[]; total: number; nextToken: number[] | null }> {
  const {
    region,
    district,
    districts,
    keyword,
    sortMethod = 'rating-desc',
    is247,
    fehdLicensed,
    verified,
    petAccessArea,
    petEntryPolicy,
    limit = RESTAURANT_SEARCH_PAGE_SIZE,
    nextToken,
    fullFields = false,
  } = options;

  try {
    const variables: Record<string, unknown> = {
      location: HK_CENTER,
      limit,
      sortMethod,
    };

    applyPlaceDistrictSearchVariables(variables, { region, district, districts });

    if (keyword) {
      variables.keyword = keyword;
    }

    if (is247 !== undefined) {
      variables.is247 = is247;
    }

    if (fehdLicensed !== undefined) {
      variables.fehdLicensed = fehdLicensed;
    }

    if (verified === true) {
      variables.verified = true;
    }

    if (petAccessArea) {
      variables.petAccessArea = petAccessArea;
    }

    if (petEntryPolicy) {
      variables.petEntryPolicy = petEntryPolicy;
    }

    if (shouldIncludeDevListings()) {
      variables.includeDevListings = true;
    }

    const normalizedNextToken = normalizePlaceSearchNextToken(nextToken);
    if (normalizedNextToken) {
      variables.nextToken = normalizedNextToken;
    }

    const { items, total, nextToken: resultNextToken } = await runPlaceSearch<ApiRestaurant>(
      'restaurant',
      variables,
      { fullFields, fallback: 'Failed to fetch restaurants' },
    );

    const restaurants = items
      .filter((item) => shouldIncludeDevListings() || !isDevListing(item.isDevListing))
      .map((item) => transformRestaurant(item, language));

    // Rating lists: premium first. Location/nearby: keep distance order from server.
    return {
      restaurants: sortMethod === 'location' ? restaurants : sortPremiumFirst(restaurants),
      total,
      nextToken: resultNextToken,
    };
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch restaurants');
  }
}

export async function fetchFehdLicensedRestaurants(
  options: { limit?: number; nextToken?: string | null } = {},
  language: string = 'zh',
): Promise<{ restaurants: Restaurant[]; nextToken: string | null }> {
  const { limit = RESTAURANT_SEARCH_PAGE_SIZE, nextToken = null } = options;

  try {
    const result = await graphqlQuery<{
      listRestaurants: { items: ApiRestaurant[]; nextToken?: string | null };
    }>(LIST_FEHD_RESTAURANTS_QUERY, { limit, nextToken });

    const restaurants = (result.listRestaurants.items || [])
      .filter((item): item is ApiRestaurant => Boolean(item?.id))
      .filter((item) => shouldIncludeDevListings() || !isDevListing(item.isDevListing))
      .map((item) => transformRestaurant(item, language));

    return {
      restaurants: sortPremiumFirst(restaurants),
      nextToken: result.listRestaurants.nextToken ?? null,
    };
  } catch (error) {
    console.error('Error fetching FEHD licensed restaurants:', error);
    throw new Error('Failed to fetch FEHD licensed restaurants');
  }
}

export async function fetchAllRestaurants(language: string = 'zh'): Promise<Restaurant[]> {
  const allItems: ApiRestaurant[] = [];
  let nextToken: string | null = null;

  try {
    do {
      const result = await graphqlQuery<{
        listRestaurants: { items: ApiRestaurant[]; nextToken?: string | null };
      }>(LIST_RESTAURANTS_QUERY, { limit: LIST_PAGE_SIZE, nextToken });

      const pageItems = (result.listRestaurants.items || []).filter(
        (item): item is ApiRestaurant => Boolean(item?.id),
      );
      allItems.push(...pageItems);

      nextToken = result.listRestaurants.nextToken ?? null;
    } while (nextToken);

    return allItems
      .filter((item) => shouldIncludeDevListings() || !isDevListing(item.isDevListing))
      .map(item => transformRestaurant(item, language));
  } catch (error) {
    console.error('Error fetching all restaurants:', error);
    throw new Error('Failed to fetch restaurants');
  }
}

export async function fetchRestaurantById(id: string): Promise<ApiRestaurant> {
  try {
    let result: { getRestaurant: ApiRestaurant };
    try {
      result = await graphqlQuery<{ getRestaurant: ApiRestaurant }>(
        GET_RESTAURANT_QUERY,
        { id },
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (/partnerReply/i.test(message) && /FieldUndefined/i.test(message)) {
        console.warn(
          'getRestaurant: partnerReply not in schema yet; retrying without partnerReply',
        );
        try {
          result = await graphqlQuery<{ getRestaurant: ApiRestaurant }>(
            GET_RESTAURANT_QUERY_WITHOUT_PARTNER_REPLY,
            { id },
          );
        } catch (innerErr: unknown) {
          const innerMessage =
            innerErr instanceof Error ? innerErr.message : String(innerErr);
          if (/reservationSettings|FieldUndefined/i.test(innerMessage)) {
            console.warn(
              'getRestaurant: reservationSettings unavailable; using legacy query',
            );
            result = await graphqlQuery<{ getRestaurant: ApiRestaurant }>(
              GET_RESTAURANT_QUERY_LEGACY,
              { id },
            );
          } else {
            throw innerErr;
          }
        }
      } else if (/reservationSettings/i.test(message) && /FieldUndefined/i.test(message)) {
        console.warn(
          'getRestaurant: reservationSettings unavailable; using legacy query',
        );
        result = await graphqlQuery<{ getRestaurant: ApiRestaurant }>(
          GET_RESTAURANT_QUERY_LEGACY,
          { id },
        );
      } else {
        throw err;
      }
    }

    const restaurant = result.getRestaurant;
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    if (isDevListing(restaurant.isDevListing) && !shouldIncludeDevListings()) {
      throw new Error('Restaurant not found');
    }
    const parsedMeta = parseRestaurantExternalMetadata(restaurant.externalMetadata);
    return {
      ...restaurant,
      externalMetadata: parsedMeta,
      fehdLicensed: restaurant.fehdLicensed === true || isFehdLicensed(parsedMeta),
    };
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch restaurant');
  }
}

// Fetch restaurants near a specific location
export async function fetchNearbyRestaurants(
  eventLat: number,
  eventLon: number,
  language: string = 'zh',
  maxDistanceKm: number = 5
): Promise<{ restaurant: Restaurant; distance: number }[]> {
  try {
    const variables: Record<string, unknown> = {
      location: { lat: eventLat, lon: eventLon },
      limit: 100,
      sortMethod: 'location',
    };

    if (shouldIncludeDevListings()) {
      variables.includeDevListings = true;
    }

    const { items } = await runPlaceSearch<ApiRestaurant>(
      'restaurant',
      variables,
      { fullFields: true, fallback: 'Failed to fetch nearby restaurants' },
    );

    const restaurantsWithDistance = items
      .filter(item =>
        isVerified(item.verified) &&
        item.location?.lat &&
        item.location?.lon &&
        (shouldIncludeDevListings() || !isDevListing(item.isDevListing))
      )
      .map(item => {
        const restaurant = transformRestaurant(item, language);
        const distance = calculateDistance(
          eventLat,
          eventLon,
          item.location!.lat,
          item.location!.lon
        );
        return { restaurant, distance };
      })
      .filter(({ distance }) => distance <= maxDistanceKm)
      .sort((a, b) => {
        // Nearby: closer first; premium only breaks distance ties.
        if (a.distance !== b.distance) return a.distance - b.distance;
        return (
          Number(isEffectivePremium(b.restaurant)) - Number(isEffectivePremium(a.restaurant))
        );
      });

    return restaurantsWithDistance;
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch nearby restaurants');
  }
}
