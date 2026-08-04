import { graphqlQuery } from './graphqlClient';
import {
  getRegionFromDistrict as getRegionFromDistrictData,
  mapFilterToRegionKey,
  districtBelongsToRegion,
} from '@/data/hongKongDistricts';
import {
  isIncompleteVenueName,
  isInternalResearchNote,
  sanitizePublicNote,
} from '@/utils/mallPublicCopy';
import { localizeOpeningHoursText } from '@/utils/availableHours';

export type MallPetsAllowed = 'YES' | 'NO' | 'UNKNOWN';
export type MallPetMovementMode =
  | 'LEASH_WALK_OK'
  | 'CARRIER_OR_HELD_ONLY'
  | 'DESIGNATED_WALK_ZONES'
  | 'UNKNOWN';

export interface ApiMall {
  id: string;
  name: { zh?: string | null; en?: string | null };
  district?: string | null;
  region?: string | null;
  address: { zh?: string | null; en?: string | null };
  location?: { lat: number; lon: number } | null;
  phoneNo?: string | null;
  mtrAccess?: { zh?: string | null; en?: string | null } | null;
  website?: string | null;
  diningWebsite?: string | null;
  parkingWebsite?: string | null;
  googleMapsUrl?: string | null;
  coverPhoto?: string | null;
  gallery?: string[] | null;
  availableHours?: {
    otherConditions?: string;
    mon?: Array<{ start?: string; end?: string }>;
    tue?: Array<{ start?: string; end?: string }>;
    wed?: Array<{ start?: string; end?: string }>;
    thu?: Array<{ start?: string; end?: string }>;
    fri?: Array<{ start?: string; end?: string }>;
    sat?: Array<{ start?: string; end?: string }>;
    sun?: Array<{ start?: string; end?: string }>;
  } | null;
  verified?: boolean | null;
  isDevListing?: boolean | null;
  petsAllowed?: MallPetsAllowed | null;
  petMovementMode?: MallPetMovementMode | null;
  petPolicyNotes?: { zh?: string | null; en?: string | null } | null;
  listingAlert?: { zh?: string | null; en?: string | null } | null;
  petPolicyDetails?: unknown;
  parkingDetails?: unknown;
  sourceEvidence?: unknown;
  externalMetadata?: unknown;
}

export interface MallWalkZone {
  label: string;
  floors: string[];
  zoneType?: string | null;
  notes: string;
}

export interface MallRestrictedZone {
  label: string;
  reason?: string | null;
  notes: string;
}

export interface MallDiningVenue {
  name: string;
  floor?: string | null;
  indoorOutdoor?: string | null;
  restaurantId?: string | null;
}

export interface MallStrollerLoan {
  available: boolean;
  locations: string[];
  depositHkd?: number | null;
  requiresMembership?: boolean | null;
  membershipName?: string | null;
  notes: string;
}

export interface MallAmenities {
  petToilet?: boolean | null;
  petParkOrGarden?: boolean | null;
  petParkLocation: string;
  petParkHours?: string | null;
  petElevator?: boolean | null;
  waterBowl?: boolean | null;
  other: string;
}

export interface MallCommonAreaRules {
  leashRequired?: boolean | null;
  carrierOrStrollerOrHeldRequired?: boolean | null;
  muzzleSuggestedForLargeDogs?: boolean | null;
  maxWeightKg?: number | null;
  sizeLimitNotes: string;
}

export interface MallPetPolicy {
  commonArea: MallCommonAreaRules | null;
  walkZones: MallWalkZone[];
  restrictedZones: MallRestrictedZone[];
  diningAvailable?: boolean | null;
  diningVenues: MallDiningVenue[];
  diningNotes: string;
  stroller: MallStrollerLoan | null;
  /** Explicitly no stroller loan when seed says available === false */
  strollerUnavailable: boolean;
  amenities: MallAmenities | null;
  rawPolicySummary: string;
}

export interface MallParkingOffer {
  dayType?: string | null;
  spendHkd?: number | null;
  freeHours?: number | null;
  notes: string;
}

export interface MallParking {
  hasOwnCarPark?: boolean | null;
  heightLimitM?: number | null;
  weekdayRateHkd?: number | null;
  weekendRateHkd?: number | null;
  rateUnit?: string | null;
  rateNotes: string;
  spendToParkOffers: MallParkingOffer[];
  petOwnerOffers: MallParkingOffer[];
  tips: string;
}

export interface Mall {
  id: string;
  name: string;
  region: string;
  regionKey: string;
  district: string;
  address: string;
  phone: string;
  mtrAccess: string;
  website?: string;
  diningWebsite?: string;
  parkingWebsite?: string;
  googleMapsUrl?: string;
  image?: string;
  gallery: string[];
  availableHours?: ApiMall['availableHours'];
  /** Prefer day-of-week slots; fall back to availableHours.otherConditions. */
  hoursSummary?: string;
  verified?: boolean;
  isDevListing?: boolean;
  petsAllowed: MallPetsAllowed;
  petMovementMode: MallPetMovementMode;
  petPolicyNotes: string;
  listingAlert: string;
  petPolicy: MallPetPolicy | null;
  parking: MallParking | null;
  location?: { lat: number; lon: number } | null;
  hasData: boolean;
}

export interface MallListingFilters {
  region?: string;
  keyword?: string;
  petsAllowedYes?: boolean;
  leashWalkOk?: boolean;
}

const LIST_PAGE_SIZE = 100;

const MALL_LIST_FIELDS = `
  id
  name { zh en }
  district
  region
  address { zh en }
  location { lat lon }
  phoneNo
  mtrAccess { zh en }
  website
  coverPhoto
  gallery
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
  verified
  isDevListing
  petsAllowed
  petMovementMode
  petPolicyNotes { zh en }
  listingAlert { zh en }
`;

const LIST_MALLS_QUERY = `
  query ListMalls($limit: Int, $nextToken: String) {
    listMalls(limit: $limit, nextToken: $nextToken) {
      items {
        ${MALL_LIST_FIELDS}
      }
      nextToken
    }
  }
`;

const GET_MALL_QUERY = `
  query GetMall($id: ID!) {
    getMall(id: $id) {
      ${MALL_LIST_FIELDS}
      diningWebsite
      parkingWebsite
      googleMapsUrl
      petPolicyDetails
      parkingDetails
      sourceEvidence
      externalMetadata
    }
  }
`;

function getMultilingualString(
  obj: { zh?: string | null; en?: string | null } | undefined | null,
  lang: 'zh' | 'en',
): string {
  if (!obj) return '';
  const other: 'zh' | 'en' = lang === 'en' ? 'zh' : 'en';
  return obj[lang]?.trim() || obj[other]?.trim() || '';
}

/** Prefer active language only — avoids mixing ZH/EN copy on the same page. */
function getLangOnlyString(
  obj: { zh?: string | null; en?: string | null } | undefined | null,
  lang: 'zh' | 'en',
): string {
  if (!obj) return '';
  return obj[lang]?.trim() || '';
}

function getPublicNote(
  obj: { zh?: string | null; en?: string | null } | undefined | null,
  lang: 'zh' | 'en',
): string {
  return sanitizePublicNote(getLangOnlyString(obj, lang));
}

function parseAwsJson<T>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') return value as T;
  return null;
}

type MultiLang = { zh?: string | null; en?: string | null };

function transformPetPolicy(raw: unknown, lang: 'zh' | 'en'): MallPetPolicy | null {
  const details = parseAwsJson<Record<string, unknown>>(raw);
  if (!details) return null;

  const commonRaw =
    details.commonArea && typeof details.commonArea === 'object'
      ? (details.commonArea as Record<string, unknown>)
      : null;
  const commonArea: MallCommonAreaRules | null = commonRaw
    ? {
        leashRequired:
          typeof commonRaw.leashRequired === 'boolean' ? commonRaw.leashRequired : null,
        carrierOrStrollerOrHeldRequired:
          typeof commonRaw.carrierOrStrollerOrHeldRequired === 'boolean'
            ? commonRaw.carrierOrStrollerOrHeldRequired
            : null,
        muzzleSuggestedForLargeDogs:
          typeof commonRaw.muzzleSuggestedForLargeDogs === 'boolean'
            ? commonRaw.muzzleSuggestedForLargeDogs
            : null,
        maxWeightKg:
          typeof commonRaw.maxWeightKg === 'number' ? commonRaw.maxWeightKg : null,
        sizeLimitNotes: getPublicNote(
          commonRaw.sizeLimitNotes as MultiLang | undefined,
          lang,
        ),
      }
    : null;

  const walkZonesRaw = Array.isArray(details.walkZones) ? details.walkZones : [];
  const walkZones: MallWalkZone[] = walkZonesRaw
    .map((zone) => {
      if (!zone || typeof zone !== 'object') return null;
      const z = zone as Record<string, unknown>;
      const label =
        getLangOnlyString(z.label as MultiLang | undefined, lang) ||
        getMultilingualString(z.label as MultiLang | undefined, lang);
      const notes = getPublicNote(z.notes as MultiLang | undefined, lang);
      const floors = Array.isArray(z.floors)
        ? z.floors.map((f) => String(f)).filter(Boolean)
        : [];
      if (!label && !notes && floors.length === 0) return null;
      return {
        label: label || notes || floors.join(', '),
        floors,
        zoneType: typeof z.zoneType === 'string' ? z.zoneType : null,
        notes,
      };
    })
    .filter(Boolean) as MallWalkZone[];

  const restrictedZones: MallRestrictedZone[] = (
    Array.isArray(details.restrictedZones) ? details.restrictedZones : []
  )
    .map((zone) => {
      if (typeof zone === 'string') {
        const label = sanitizePublicNote(zone.trim());
        return label ? { label, reason: null, notes: '' } : null;
      }
      if (!zone || typeof zone !== 'object') return null;
      const z = zone as Record<string, unknown>;
      const label =
        getLangOnlyString(z.label as MultiLang | undefined, lang) ||
        getMultilingualString(z.label as MultiLang | undefined, lang);
      const notes = getPublicNote(z.notes as MultiLang | undefined, lang);
      if (!label && !notes) return null;
      if (isInternalLabel(label) && !notes) return null;
      return {
        label: label || notes,
        reason: typeof z.reason === 'string' ? z.reason : null,
        notes,
      };
    })
    .filter(Boolean) as MallRestrictedZone[];

  const dining = (details.dining && typeof details.dining === 'object'
    ? (details.dining as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const diningAvailable =
    typeof dining.petFriendlyDiningAvailable === 'boolean'
      ? dining.petFriendlyDiningAvailable
      : null;
  const venuesRaw = Array.isArray(dining.knownPetFriendlyVenues)
    ? dining.knownPetFriendlyVenues
    : [];
  const diningVenues: MallDiningVenue[] = venuesRaw
    .map((venue) => {
      if (!venue || typeof venue !== 'object') return null;
      const v = venue as Record<string, unknown>;
      const name =
        getLangOnlyString(v.name as MultiLang | undefined, lang) ||
        getMultilingualString(v.name as MultiLang | undefined, lang);
      if (!name || isIncompleteVenueName(name)) return null;
      return {
        name,
        floor: typeof v.floor === 'string' ? v.floor : null,
        indoorOutdoor: typeof v.indoorOutdoor === 'string' ? v.indoorOutdoor : null,
        restaurantId: typeof v.restaurantId === 'string' ? v.restaurantId : null,
      };
    })
    .filter(Boolean) as MallDiningVenue[];

  const strollerRaw =
    details.strollerLoan && typeof details.strollerLoan === 'object'
      ? (details.strollerLoan as Record<string, unknown>)
      : null;
  let stroller: MallStrollerLoan | null = null;
  const strollerUnavailable = strollerRaw?.available === false;
  if (strollerRaw && strollerRaw.available === true) {
    const locations = (Array.isArray(strollerRaw.locations) ? strollerRaw.locations : [])
      .map((loc) => {
        const text =
          getLangOnlyString(loc as MultiLang, lang) ||
          getMultilingualString(loc as MultiLang, lang);
        const cleaned = sanitizePublicNote(text);
        if (cleaned) return cleaned;
        if (text && !isInternalResearchNote(text)) return text.trim();
        return '';
      })
      .filter(Boolean);
    stroller = {
      available: true,
      locations,
      depositHkd: typeof strollerRaw.depositHkd === 'number' ? strollerRaw.depositHkd : null,
      requiresMembership:
        typeof strollerRaw.requiresMembership === 'boolean'
          ? strollerRaw.requiresMembership
          : null,
      membershipName:
        typeof strollerRaw.membershipName === 'string' ? strollerRaw.membershipName : null,
      notes: getPublicNote(strollerRaw.notes as MultiLang | undefined, lang),
    };
  }

  const amenitiesRaw =
    details.amenities && typeof details.amenities === 'object'
      ? (details.amenities as Record<string, unknown>)
      : null;
  const amenities: MallAmenities | null = amenitiesRaw
    ? {
        petToilet:
          typeof amenitiesRaw.petToilet === 'boolean' ? amenitiesRaw.petToilet : null,
        petParkOrGarden:
          typeof amenitiesRaw.petParkOrGarden === 'boolean'
            ? amenitiesRaw.petParkOrGarden
            : null,
        petParkLocation:
          getLangOnlyString(amenitiesRaw.petParkLocation as MultiLang | undefined, lang) ||
          getMultilingualString(amenitiesRaw.petParkLocation as MultiLang | undefined, lang),
        petParkHours:
          typeof amenitiesRaw.petParkHours === 'string' ? amenitiesRaw.petParkHours : null,
        petElevator:
          typeof amenitiesRaw.petElevator === 'boolean' ? amenitiesRaw.petElevator : null,
        waterBowl:
          typeof amenitiesRaw.waterBowl === 'boolean' ? amenitiesRaw.waterBowl : null,
        other: getPublicNote(amenitiesRaw.other as MultiLang | undefined, lang),
      }
    : null;

  const diningNotes = getPublicNote(dining.notes as MultiLang | undefined, lang);
  const rawPolicySummary = getPublicNote(
    details.rawPolicySummary as MultiLang | undefined,
    lang,
  );

  const hasCommonRules =
    !!commonArea &&
    (commonArea.leashRequired != null ||
      commonArea.carrierOrStrollerOrHeldRequired != null ||
      commonArea.muzzleSuggestedForLargeDogs != null ||
      commonArea.maxWeightKg != null ||
      !!commonArea.sizeLimitNotes);

  const hasContent =
    hasCommonRules ||
    walkZones.length > 0 ||
    restrictedZones.length > 0 ||
    diningAvailable != null ||
    diningVenues.length > 0 ||
    !!stroller ||
    strollerUnavailable ||
    amenities?.petToilet != null ||
    amenities?.petParkOrGarden != null ||
    !!amenities?.other ||
    !!diningNotes;

  if (!hasContent) return null;

  return {
    commonArea: hasCommonRules ? commonArea : null,
    walkZones,
    restrictedZones,
    diningAvailable,
    diningVenues,
    diningNotes,
    stroller,
    strollerUnavailable,
    amenities,
    rawPolicySummary,
  };
}

function isInternalLabel(label: string): boolean {
  return /未讀出|通話中|未報出|未提供/.test(label);
}

function transformParking(raw: unknown, lang: 'zh' | 'en'): MallParking | null {
  const details = parseAwsJson<Record<string, unknown>>(raw);
  if (!details) return null;

  const hourly =
    details.hourlyRate && typeof details.hourlyRate === 'object'
      ? (details.hourlyRate as Record<string, unknown>)
      : {};

  const mapOffer = (offer: unknown): MallParkingOffer | null => {
    if (!offer || typeof offer !== 'object') return null;
    const o = offer as Record<string, unknown>;
    const notes = getPublicNote(o.notes as MultiLang | undefined, lang);
    return {
      dayType: typeof o.dayType === 'string' ? o.dayType : null,
      spendHkd: typeof o.spendHkd === 'number' ? o.spendHkd : null,
      freeHours: typeof o.freeHours === 'number' ? o.freeHours : null,
      notes,
    };
  };

  const spendToParkOffers = (Array.isArray(details.spendToParkOffers)
    ? details.spendToParkOffers
    : []
  )
    .map(mapOffer)
    .filter(Boolean) as MallParkingOffer[];
  const petOwnerOffers = (Array.isArray(details.petOwnerOffers) ? details.petOwnerOffers : [])
    .map(mapOffer)
    .filter(Boolean) as MallParkingOffer[];

  const parking: MallParking = {
    hasOwnCarPark:
      typeof details.hasOwnCarPark === 'boolean' ? details.hasOwnCarPark : null,
    heightLimitM: typeof details.heightLimitM === 'number' ? details.heightLimitM : null,
    weekdayRateHkd: typeof hourly.weekdayHkd === 'number' ? hourly.weekdayHkd : null,
    weekendRateHkd: typeof hourly.weekendHkd === 'number' ? hourly.weekendHkd : null,
    rateUnit: typeof hourly.unit === 'string' ? hourly.unit : null,
    rateNotes: getPublicNote(hourly.notes as MultiLang | undefined, lang),
    spendToParkOffers,
    petOwnerOffers,
    tips: getPublicNote(details.tips as MultiLang | undefined, lang),
  };

  const hasContent =
    parking.hasOwnCarPark != null ||
    parking.heightLimitM != null ||
    parking.weekdayRateHkd != null ||
    parking.weekendRateHkd != null ||
    !!parking.rateNotes ||
    spendToParkOffers.length > 0 ||
    petOwnerOffers.length > 0 ||
    !!parking.tips;

  return hasContent ? parking : null;
}

function getHoursSummary(
  availableHours: ApiMall['availableHours'] | undefined,
  language: string = 'zh',
): string {
  if (!availableHours) return '';
  const other = availableHours.otherConditions?.trim();
  if (other) return localizeOpeningHoursText(other, language);
  return '';
}

/** Map seed region codes / Chinese keys to listing filter keys (香港/九龍/新界/Others). */
function normalizeRegionKey(region: string | null | undefined, district: string | null | undefined): string {
  const fromDistrict = getRegionFromDistrictData(district);
  if (fromDistrict && fromDistrict !== 'Others') return fromDistrict;

  const raw = (region || '').trim().toUpperCase();
  if (raw === 'KOWLOON' || raw === '九龍') return '九龍';
  if (raw === 'HONG_KONG' || raw === 'HONG KONG' || raw === '香港') return '香港';
  if (
    raw === 'NEW_TERRITORIES' ||
    raw === 'NEW TERRITORIES' ||
    raw === '新界'
  ) {
    return '新界';
  }
  if (raw === 'ISLANDS' || raw === '離島') return '離島';
  return fromDistrict || 'Others';
}

export function transformMall(apiMall: ApiMall, language: string = 'zh'): Mall {
  const lang = language === 'en' ? 'en' : 'zh';
  const regionKey = normalizeRegionKey(apiMall.region, apiMall.district);
  const availableHours = apiMall.availableHours || undefined;

  return {
    id: apiMall.id,
    name: getMultilingualString(apiMall.name, lang) || (lang === 'en' ? 'Unnamed mall' : '未命名商場'),
    region: regionKey,
    regionKey,
    district: apiMall.district?.trim() || '',
    address: getMultilingualString(apiMall.address, lang),
    phone: apiMall.phoneNo?.trim() || '',
    mtrAccess: getMultilingualString(apiMall.mtrAccess, lang),
    website: apiMall.website || undefined,
    diningWebsite: apiMall.diningWebsite || undefined,
    parkingWebsite: apiMall.parkingWebsite || undefined,
    googleMapsUrl: apiMall.googleMapsUrl || undefined,
    image: apiMall.coverPhoto || undefined,
    gallery: (apiMall.gallery || []).filter(Boolean) as string[],
    availableHours,
    hoursSummary: getHoursSummary(availableHours, lang) || undefined,
    verified: apiMall.verified === true,
    isDevListing: apiMall.isDevListing === true,
    petsAllowed: apiMall.petsAllowed || 'UNKNOWN',
    petMovementMode: apiMall.petMovementMode || 'UNKNOWN',
    petPolicyNotes: getPublicNote(apiMall.petPolicyNotes, lang),
    listingAlert:
      getLangOnlyString(apiMall.listingAlert, lang) ||
      getMultilingualString(apiMall.listingAlert, lang),
    petPolicy: transformPetPolicy(apiMall.petPolicyDetails, lang),
    parking: transformParking(apiMall.parkingDetails, lang),
    location: apiMall.location || null,
    hasData: true,
  };
}

export async function fetchAllMalls(language: string = 'zh'): Promise<Mall[]> {
  const allItems: ApiMall[] = [];
  let nextToken: string | null = null;

  do {
    const result = await graphqlQuery<{
      listMalls: { items: Array<ApiMall | null>; nextToken?: string | null };
    }>(LIST_MALLS_QUERY, { limit: LIST_PAGE_SIZE, nextToken });

    for (const item of result.listMalls.items || []) {
      if (item?.id) allItems.push(item);
    }
    nextToken = result.listMalls.nextToken ?? null;
  } while (nextToken);

  return allItems
    .filter((mall) => mall.isDevListing !== true)
    .map((mall) => transformMall(mall, language));
}

export function filterMalls(malls: Mall[], filters: MallListingFilters = {}): Mall[] {
  const keyword = filters.keyword?.trim().toLowerCase();
  const regionKey =
    filters.region && filters.region !== 'all'
      ? mapFilterToRegionKey(filters.region)
      : null;

  return malls.filter((mall) => {
    if (regionKey && regionKey !== 'Others') {
      const matchesRegion =
        mall.regionKey === regionKey || districtBelongsToRegion(mall.district, regionKey);
      if (!matchesRegion) return false;
    } else if (regionKey === 'Others') {
      if (mall.regionKey !== 'Others') return false;
    }

    if (filters.petsAllowedYes && mall.petsAllowed !== 'YES') return false;
    if (filters.leashWalkOk && mall.petMovementMode !== 'LEASH_WALK_OK') return false;

    if (keyword) {
      const hay = [mall.name, mall.district, mall.address, mall.mtrAccess]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(keyword)) return false;
    }

    return true;
  });
}

export async function fetchMallById(id: string): Promise<ApiMall> {
  const result = await graphqlQuery<{ getMall: ApiMall | null }>(GET_MALL_QUERY, { id });
  if (!result.getMall) {
    throw new Error('Mall not found');
  }
  return result.getMall;
}

export function getMallMovementLabel(
  mode: MallPetMovementMode,
  lang: 'zh' | 'en',
): string {
  const labels: Record<MallPetMovementMode, { zh: string; en: string }> = {
    LEASH_WALK_OK: { zh: '可牽繩步行', en: 'Leash walk OK' },
    CARRIER_OR_HELD_ONLY: { zh: '需推車／抱住', en: 'Carrier / held only' },
    DESIGNATED_WALK_ZONES: { zh: '指定步行區', en: 'Designated walk zones' },
    UNKNOWN: { zh: '政策未明', en: 'Policy unknown' },
  };
  return labels[mode]?.[lang] || labels.UNKNOWN[lang];
}

export function getMallPetsAllowedLabel(
  value: MallPetsAllowed,
  lang: 'zh' | 'en',
): string {
  const labels: Record<MallPetsAllowed, { zh: string; en: string }> = {
    YES: { zh: '歡迎寵物', en: 'Pets welcome' },
    NO: { zh: '不設寵物', en: 'No pets' },
    UNKNOWN: { zh: '未知', en: 'Unknown' },
  };
  return labels[value]?.[lang] || labels.UNKNOWN[lang];
}
