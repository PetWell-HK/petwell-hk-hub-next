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

export interface ApiSalon {
  id: string;
  ownerSub?: string | null;
  name: {
    zh: string;
    en: string;
  };
  address: {
    zh: string;
    en: string;
  };
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

export interface Salon {
  id: string;
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  rating: number;
  totalReviews: number;
  services: string[];
  availableHours?: ApiSalon['availableHours'];
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

/** Prefer current language; if missing or empty, use the other (zh ??en). */
function getMultilingualString(
  obj: { zh?: string; en?: string } | undefined,
  lang: 'zh' | 'en'
): string {
  if (!obj) return '';
  const other: 'zh' | 'en' = lang === 'en' ? 'zh' : 'en';
  const primary = obj[lang]?.trim();
  const fallback = obj[other]?.trim();
  return primary || fallback || '';
}

export function transformSalon(apiSalon: ApiSalon, language: string = 'zh'): Salon {
  const lang = language === 'en' ? 'en' : 'zh';
  return {
    id: apiSalon.id,
    name: getMultilingualString(apiSalon.name, lang),
    region: getRegionFromDistrict(apiSalon.district),
    district: apiSalon.district,
    address: getMultilingualString(apiSalon.address, lang),
    phone: apiSalon.phoneNo,
    rating: apiSalon.totalRating,
    totalReviews: apiSalon.numReviews,
    services: apiSalon.serviceOfferings ? apiSalon.serviceOfferings.split(',').map(s => s.trim()) : [],
    availableHours: apiSalon.availableHours,
    image: apiSalon.coverPhoto,
    hasData: true,
    is247: apiSalon.is247,
    verified: apiSalon.verified,
    partnerPlan: apiSalon.partnerPlan ?? null,
    partnerPlanExpiresAt: apiSalon.partnerPlanExpiresAt ?? null,
    isPremium:
      apiSalon.partnerPlan === 'PREMIUM' &&
      (!apiSalon.partnerPlanExpiresAt ||
        Date.parse(apiSalon.partnerPlanExpiresAt) > Date.now()),
  };
}

const LIST_SALONS_QUERY = `
  query ListSalons($limit: Int, $nextToken: String) {
    listSalons(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name {
          zh
          en
        }
        address {
          zh
          en
        }
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

export async function searchSalons(
  options: PlaceSearchOptions = {},
  language: string = 'zh',
): Promise<{ salons: Salon[]; total: number; nextToken: number[] | null }> {
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

    const { items, total, nextToken: resultNextToken } = await runPlaceSearch<ApiSalon>(
      'salon',
      variables,
      { fallback: 'Failed to search salons' },
    );
    const salons = items
      .filter((salon): salon is ApiSalon => Boolean(salon?.id))
      .map((salon) => transformSalon(salon, language));

    return {
      salons: sortMethod === 'location' ? salons : sortPremiumFirst(salons),
      total,
      nextToken: resultNextToken,
    };
  } catch (error) {
    console.error('Error searching salons:', error);
    throw error instanceof Error ? error : new Error('Failed to search salons');
  }
}

export { getPlaceSearchNextPageParam as getSalonSearchNextPageParam };

export const GET_SALON_QUERY = `
  query GetSalon($id: ID!) {
    getSalon(id: $id) {
      id
      ownerSub
      name {
        zh
        en
      }
      district
      address {
        zh
        en
      }
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

export async function fetchSalons(language: string = 'zh'): Promise<Salon[]> {
  try {
    const allItems: ApiSalon[] = [];
    let nextToken: string | null = null;

    do {
      const result = await graphqlQuery<{
        listSalons: { items: ApiSalon[]; nextToken?: string | null };
      }>(LIST_SALONS_QUERY, { limit: LIST_PAGE_SIZE, nextToken });

      allItems.push(...(result.listSalons.items || []));
      nextToken = result.listSalons.nextToken ?? null;
    } while (nextToken);

    return allItems.map(salon => transformSalon(salon, language));
  } catch (error) {
    console.error('Error fetching salons:', error);
    throw new Error('Failed to fetch salons');
  }
}

export async function fetchSalonById(id: string): Promise<ApiSalon> {
  try {
    const result = await graphqlQueryWithPartnerReplyFallback<{ getSalon: ApiSalon }>(
      GET_SALON_QUERY,
      { id },
    );

    if (result.getSalon.reviews?.items) {
      result.getSalon.reviews.items = result.getSalon.reviews.items.slice(0, 3);
    }

    return result.getSalon;
  } catch (error) {
    console.error('Error fetching salon:', error);
    throw new Error('Failed to fetch salon');
  }
}
