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

export interface ApiClinic {
  id: string;
  ownerSub?: string | null;
  name: {
    zh: string | null;
    en: string | null;
  } | null;
  address: {
    zh: string | null;
    en: string | null;
  } | null;
  district: string | null;
  phoneNo: string | null;
  website?: string;
  email?: string;
  totalRating: number;
  numReviews: number;
  is247: boolean;
  verified: boolean;
  partnerPlan?: string | null;
  partnerPlanExpiresAt?: string | null;
  serviceOfferings: string;
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
  coverPhoto?: string;
  gallery?: string[];
  reviews?: {
    items: Array<{
      id: string;
      reviewerId?: string | null;
      anonymous?: boolean | null;
      title: string;
      description: string;
      totalRating: number;
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
    nextToken: string | null;
  };
  reservationSettings?: unknown;
}

export interface Clinic {
  id: string;
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  rating: number;
  totalReviews: number;
  services: string[];
  availableHours?: ApiClinic['availableHours'];
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

// Map district to region using the comprehensive district data
function getRegionFromDistrict(district: string): string {
  return getRegionFromDistrictData(district);
}

// Transform API clinic to app clinic format
export function transformClinic(apiClinic: ApiClinic, language: string = 'zh'): Clinic {
  const lang = language === 'en' ? 'en' : 'zh';
  const fallbackName = lang === 'en' ? 'Unnamed clinic' : '未命名診所';
  const fallbackAddress = lang === 'en' ? 'Address unavailable' : '地址未提供';
  const localizedName = apiClinic.name?.[lang] || apiClinic.name?.zh || apiClinic.name?.en || fallbackName;
  const localizedAddress = apiClinic.address?.[lang] || apiClinic.address?.zh || apiClinic.address?.en || fallbackAddress;
  const district = apiClinic.district || '';

  return {
    id: apiClinic.id,
    name: localizedName,
    region: getRegionFromDistrict(district),
    district,
    address: localizedAddress,
    phone: apiClinic.phoneNo || '',
    rating: apiClinic.totalRating,
    totalReviews: apiClinic.numReviews,
    services: apiClinic.serviceOfferings ? apiClinic.serviceOfferings.split(',').map(s => s.trim()) : [],
    availableHours: apiClinic.availableHours,
    image: apiClinic.coverPhoto,
    hasData: true,
    is247: apiClinic.is247,
    verified: apiClinic.verified,
    partnerPlan: apiClinic.partnerPlan ?? null,
    partnerPlanExpiresAt: apiClinic.partnerPlanExpiresAt ?? null,
    isPremium:
      apiClinic.partnerPlan === 'PREMIUM' &&
      (!apiClinic.partnerPlanExpiresAt ||
        Date.parse(apiClinic.partnerPlanExpiresAt) > Date.now()),
  };
}

const LIST_CLINICS_QUERY = `
  query ListClinics($limit: Int, $nextToken: String) {
    listClinics(limit: $limit, nextToken: $nextToken) {
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

export async function searchClinics(
  options: PlaceSearchOptions = {},
  language: string = 'zh',
): Promise<{ clinics: Clinic[]; total: number; nextToken: number[] | null }> {
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

    const { items, total, nextToken: resultNextToken } = await runPlaceSearch<ApiClinic>(
      'clinic',
      variables,
      { fallback: 'Failed to search clinics' },
    );
    const clinics = items
      .filter((clinic): clinic is ApiClinic => Boolean(clinic?.id))
      .map((clinic) => transformClinic(clinic, language));

    return {
      clinics: sortMethod === 'location' ? clinics : sortPremiumFirst(clinics),
      total,
      nextToken: resultNextToken,
    };
  } catch (error) {
    console.error('Error searching clinics:', error);
    throw error instanceof Error ? error : new Error('Failed to search clinics');
  }
}

export { getPlaceSearchNextPageParam as getClinicSearchNextPageParam };

export const GET_CLINIC_QUERY = `
  query GetClinic($id: ID!) {
    getClinic(id: $id) {
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

export async function fetchClinics(language: string = 'zh'): Promise<Clinic[]> {
  try {
    const allItems: ApiClinic[] = [];
    let nextToken: string | null = null;

    do {
      const result = await graphqlQuery<{
        listClinics: { items: ApiClinic[]; nextToken?: string | null };
      }>(LIST_CLINICS_QUERY, { limit: LIST_PAGE_SIZE, nextToken });

      allItems.push(...(result.listClinics.items || []));
      nextToken = result.listClinics.nextToken ?? null;
    } while (nextToken);

    return allItems
      .filter((clinic): clinic is ApiClinic => Boolean(clinic?.id))
      .map(clinic => transformClinic(clinic, language));
  } catch (error) {
    console.error('Error fetching clinics:', error);
    throw new Error('Failed to fetch clinics');
  }
}

export async function fetchClinicById(id: string): Promise<ApiClinic> {
  try {
    const result = await graphqlQueryWithPartnerReplyFallback<{ getClinic: ApiClinic }>(
      GET_CLINIC_QUERY,
      { id },
    );

    // Limit reviews to 3
    if (result.getClinic.reviews?.items) {
      result.getClinic.reviews.items = result.getClinic.reviews.items.slice(0, 3);
    }

    return result.getClinic;
  } catch (error) {
    console.error('Error fetching clinic:', error);
    throw new Error('Failed to fetch clinic');
  }
}
