import { graphqlQuery } from './graphqlClient';
import { getRegionFromDistrict as getRegionFromDistrictData } from '@/data/hongKongDistricts';
import {
  HK_CENTER,
  PLACE_SEARCH_PAGE_SIZE,
  applyPlaceDistrictSearchVariables,
  getPlaceSearchNextPageParam,
  normalizePlaceSearchNextToken,
  runPlaceSearch,
  type PlaceSearchOptions,
} from './placeSearchUtils';
import { graphqlQueryWithPartnerReplyFallback } from './partnerReplyQuery';
import { sortPremiumFirst } from '@/utils/partnerPremium';

export interface ApiLodging {
  id: string;
  ownerSub?: string | null;
  name: { zh: string; en: string };
  address: { zh: string; en: string };
  district: string;
  phoneNo: string;
  website?: string;
  email?: string;
  totalRating: number;
  numReviews: number;
  is247: boolean;
  verified: boolean;
  partnerPlan?: string | null;
  partnerPlanExpiresAt?: string | null;
  serviceOfferings: string;
  coverPhoto?: string;
  gallery?: string[];
  availableHours?: {
    otherConditions?: string;
    mon?: { start: string; end: string };
    tue?: { start: string; end: string };
    wed?: { start: string; end: string };
    thu?: { start: string; end: string };
    fri?: { start: string; end: string };
    sat?: { start: string; end: string };
    sun?: { start: string; end: string };
  };
  reviews?: {
    items: Array<{
      id: string;
      reviewerId?: string | null;
      title?: string;
      description: string;
      totalRating: number;
      environmentRating?: number;
      serviceRating?: number;
      personnelRating?: number;
      waitingRating?: number;
      valueRating?: number;
      fileAttachments?: string[];
      source?: string;
      anonymous?: boolean;
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
    nextToken: string | null;
  };
  reservationSettings?: unknown;
}

export interface Lodging {
  id: string;
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  rating: number;
  totalReviews: number;
  services: string[];
  availableHours?: ApiLodging['availableHours'];
  image?: string;
  hasData: boolean;
  is247?: boolean;
  ownerSub?: string | null;
  reservationSettings?: unknown;
  verified?: boolean;
  partnerPlan?: string | null;
  partnerPlanExpiresAt?: string | null;
  isPremium?: boolean;
}

function getRegionFromDistrict(district: string): string {
  return getRegionFromDistrictData(district);
}

function getMultilingualString(obj: { zh?: string; en?: string } | undefined, lang: 'zh' | 'en'): string {
  if (!obj) return '';
  const other: 'zh' | 'en' = lang === 'en' ? 'zh' : 'en';
  return obj[lang]?.trim() || obj[other]?.trim() || '';
}

export function transformLodging(api: ApiLodging, language: string = 'zh'): Lodging {
  const lang = language === 'en' ? 'en' : 'zh';
  return {
    id: api.id,
    name: getMultilingualString(api.name, lang),
    region: getRegionFromDistrict(api.district),
    district: api.district,
    address: getMultilingualString(api.address, lang),
    phone: api.phoneNo,
    rating: api.totalRating,
    totalReviews: api.numReviews,
    services: api.serviceOfferings ? api.serviceOfferings.split(',').map(s => s.trim()) : [],
    availableHours: api.availableHours,
    image: api.coverPhoto,
    hasData: true,
    is247: api.is247,
    verified: api.verified,
    partnerPlan: api.partnerPlan ?? null,
    partnerPlanExpiresAt: api.partnerPlanExpiresAt ?? null,
    isPremium:
      api.partnerPlan === 'PREMIUM' &&
      (!api.partnerPlanExpiresAt ||
        Date.parse(api.partnerPlanExpiresAt) > Date.now()),
  };
}

const LIST_LODGINGS_QUERY = `
  query ListLodgings($limit: Int, $nextToken: String) {
    listLodgings(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name { zh en }
        address { zh en }
        district
        phoneNo
        serviceOfferings
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
        photoSource
        website
        email
        totalRating
        numReviews
        is247
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const LIST_PAGE_SIZE = 100;

export async function searchLodgings(
  options: PlaceSearchOptions = {},
  language: string = 'zh',
): Promise<{ lodgings: Lodging[]; total: number; nextToken: number[] | null }> {
  const {
    region,
    district,
    districts,
    keyword,
    is247,
    limit = PLACE_SEARCH_PAGE_SIZE,
    nextToken,
    sortMethod = 'rating-desc',
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

    const normalizedNextToken = normalizePlaceSearchNextToken(nextToken);
    if (normalizedNextToken) {
      variables.nextToken = normalizedNextToken;
    }

    const { items, total, nextToken: resultNextToken } = await runPlaceSearch<ApiLodging>(
      'lodging',
      variables,
      { fallback: 'Failed to search lodgings' },
    );
    const lodgings = items
      .filter((lodging): lodging is ApiLodging => Boolean(lodging?.id))
      .map((lodging) => transformLodging(lodging, language));

    return {
      lodgings: sortMethod === 'location' ? lodgings : sortPremiumFirst(lodgings),
      total,
      nextToken: resultNextToken,
    };
  } catch (error) {
    console.error('Error searching lodgings:', error);
    throw error instanceof Error ? error : new Error('Failed to search lodgings');
  }
}

export { getPlaceSearchNextPageParam as getLodgingSearchNextPageParam };

export const GET_LODGING_QUERY = `
  query GetLodging($id: ID!) {
    getLodging(id: $id) {
      id
      ownerSub
      name { zh en }
      district
      address { zh en }
      phoneNo
      serviceOfferings
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
      photoSource
      website
      email
      totalRating
      numReviews
      is247
      partnerPlan
      partnerPlanExpiresAt
      reservationSettings
      reviews {
        items {
          id
          reviewerId
          title
          description
          totalRating
          environmentRating
          personnelRating
          serviceRating
          valueRating
          waitingRating
          fileAttachments
          source
          anonymous
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
      createdAt
      updatedAt
    }
  }
`;

export async function fetchLodgings(language: string = 'zh'): Promise<Lodging[]> {
  const allItems: ApiLodging[] = [];
  let nextToken: string | null = null;

  do {
    const result = await graphqlQuery<{
      listLodgings: { items: ApiLodging[]; nextToken?: string | null };
    }>(LIST_LODGINGS_QUERY, { limit: LIST_PAGE_SIZE, nextToken });

    allItems.push(...(result.listLodgings.items || []));
    nextToken = result.listLodgings.nextToken ?? null;
  } while (nextToken);

  return allItems.map(item => transformLodging(item, language));
}

export async function fetchLodgingById(id: string): Promise<ApiLodging> {
  const result = await graphqlQueryWithPartnerReplyFallback<{ getLodging: ApiLodging }>(
    GET_LODGING_QUERY,
    { id },
  );
  if (result.getLodging.reviews?.items) {
    result.getLodging.reviews.items = result.getLodging.reviews.items.slice(0, 3);
  }
  return result.getLodging;
}
