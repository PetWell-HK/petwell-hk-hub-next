import { graphqlQuery } from './graphqlClient';
import {
  getRegionFromDistrict as getRegionFromDistrictData,
  mapFilterToRegionKey,
  districtBelongsToRegion,
} from '@/data/hongKongDistricts';
import { localizeOpeningHoursText } from '@/utils/availableHours';

export type HomeVisitCoverageType = 'districts' | 'radius_km' | 'all_hk' | 'custom_text';

export interface HomeVisitServiceCoverage {
  type: HomeVisitCoverageType;
  districts?: string[];
  radiusKm?: number;
  rawText?: string;
  notes?: string;
  travelFeeNote?: string;
}

export interface HomeVisitServiceItem {
  category: string;
  name?: { zh?: string | null; en?: string | null } | null;
  description?: string | null;
  species?: string[] | null;
  isHomeVisit?: boolean | null;
  requiresAppointment?: boolean | null;
}

export interface HomeVisitPricingItem {
  serviceCategory: string;
  label: string;
  currency: string;
  amountMin?: number | null;
  amountMax?: number | null;
  unit?: string | null;
  includesTravel?: boolean | null;
  rawText?: string | null;
  notes?: string | null;
}

export interface ApiHomeVisitProvider {
  id: string;
  name: { zh?: string | null; en?: string | null };
  district?: string | null;
  address?: { zh?: string | null; en?: string | null } | null;
  location?: { lat: number; lon: number } | null;
  phoneNo?: string | null;
  email?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  bookingUrl?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  description?: { zh?: string | null; en?: string | null } | null;
  serviceOfferings?: string | null;
  services?: unknown;
  pricing?: unknown;
  serviceCoverage?: unknown;
  speciesServed?: string[] | null;
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
  is247?: boolean | null;
  homeVisitConfirmed?: boolean | null;
  coverPhoto?: string | null;
  gallery?: string[] | null;
  verified?: boolean | null;
  totalRating?: number | null;
  numReviews?: number | null;
  externalMetadata?: unknown;
}

export interface HomeVisitProvider {
  id: string;
  name: string;
  region: string;
  regionKey: string;
  district: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  bookingUrl?: string;
  instagram?: string;
  facebook?: string;
  description: string;
  serviceOfferings: string[];
  services: HomeVisitServiceItem[];
  pricing: HomeVisitPricingItem[];
  serviceCoverage: HomeVisitServiceCoverage | null;
  coverageSummary: string;
  speciesServed: string[];
  availableHours?: ApiHomeVisitProvider['availableHours'];
  hoursSummary?: string;
  is247: boolean;
  homeVisitConfirmed: boolean;
  image?: string;
  gallery: string[];
  verified: boolean;
  rating: number;
  totalReviews: number;
  location?: { lat: number; lon: number } | null;
  hasData: boolean;
}

export interface HomeVisitListingFilters {
  region?: string;
  district?: string;
  keyword?: string;
  species?: string;
  serviceCategory?: string;
  is247?: boolean;
}

const LIST_PAGE_SIZE = 100;

const HOME_VISIT_LIST_FIELDS = `
  id
  name { zh en }
  district
  address { zh en }
  location { lat lon }
  phoneNo
  email
  website
  whatsapp
  bookingUrl
  instagram
  facebook
  description { zh en }
  serviceOfferings
  services
  pricing
  serviceCoverage
  speciesServed
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
  is247
  homeVisitConfirmed
  coverPhoto
  gallery
  verified
  totalRating
  numReviews
`;

const LIST_HOME_VISIT_PROVIDERS_QUERY = `
  query ListHomeVisitProviders($limit: Int, $nextToken: String) {
    listHomeVisitProviders(limit: $limit, nextToken: $nextToken) {
      items {
        ${HOME_VISIT_LIST_FIELDS}
      }
      nextToken
    }
  }
`;

const GET_HOME_VISIT_PROVIDER_QUERY = `
  query GetHomeVisitProvider($id: ID!) {
    getHomeVisitProvider(id: $id) {
      ${HOME_VISIT_LIST_FIELDS}
      externalMetadata
    }
  }
`;

type MultiLang = { zh?: string | null; en?: string | null };

function getMultilingualString(obj: MultiLang | undefined | null, lang: 'zh' | 'en'): string {
  if (!obj) return '';
  const other: 'zh' | 'en' = lang === 'en' ? 'zh' : 'en';
  return obj[lang]?.trim() || obj[other]?.trim() || '';
}

function parseAwsJson<T>(value: unknown): T | null {
  // Some writers historically JSON.stringify'd AWSJSON before Dynamo/AppSync,
  // so GraphQL may return a string that still needs another parse.
  let current: unknown = value;
  for (let i = 0; i < 3; i += 1) {
    if (current == null) return null;
    if (typeof current === 'string') {
      const trimmed = current.trim();
      if (!trimmed) return null;
      try {
        current = JSON.parse(trimmed);
        continue;
      } catch {
        return null;
      }
    }
    if (typeof current === 'object') return current as T;
    return null;
  }
  return typeof current === 'object' && current != null ? (current as T) : null;
}

function normalizeCoverageType(raw: unknown): HomeVisitCoverageType | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim().toLowerCase();
  if (value === 'districts') return 'districts';
  if (value === 'radius_km' || value === 'radius') return 'radius_km';
  if (value === 'all_hk' || value === 'all-hk' || value === 'all') return 'all_hk';
  if (value === 'custom_text' || value === 'custom') return 'custom_text';
  return null;
}

export function parseServiceCoverage(raw: unknown): HomeVisitServiceCoverage | null {
  const parsed = parseAwsJson<Record<string, unknown>>(raw);
  if (!parsed) return null;

  const type = normalizeCoverageType(parsed.type);
  if (!type) return null;

  const districts = Array.isArray(parsed.districts)
    ? parsed.districts.map((d) => String(d).trim()).filter(Boolean)
    : undefined;
  const radiusKm =
    typeof parsed.radiusKm === 'number'
      ? parsed.radiusKm
      : typeof parsed.radius_km === 'number'
        ? parsed.radius_km
        : undefined;

  return {
    type,
    districts,
    radiusKm,
    rawText: typeof parsed.rawText === 'string' ? parsed.rawText.trim() : undefined,
    notes: typeof parsed.notes === 'string' ? parsed.notes.trim() : undefined,
    travelFeeNote:
      typeof parsed.travelFeeNote === 'string' ? parsed.travelFeeNote.trim() : undefined,
  };
}

function parseServices(raw: unknown): HomeVisitServiceItem[] {
  const parsed = parseAwsJson<unknown[]>(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const s = item as Record<string, unknown>;
      const category = typeof s.category === 'string' ? s.category.trim() : '';
      if (!category) return null;
      const name =
        s.name && typeof s.name === 'object' ? (s.name as MultiLang) : null;
      return {
        category,
        name,
        description: typeof s.description === 'string' ? s.description : null,
        species: Array.isArray(s.species)
          ? s.species.map((sp) => String(sp).trim().toLowerCase()).filter(Boolean)
          : null,
        isHomeVisit: typeof s.isHomeVisit === 'boolean' ? s.isHomeVisit : null,
        requiresAppointment:
          typeof s.requiresAppointment === 'boolean' ? s.requiresAppointment : null,
      } satisfies HomeVisitServiceItem;
    })
    .filter(Boolean) as HomeVisitServiceItem[];
}

function parsePricing(raw: unknown): HomeVisitPricingItem[] {
  const parsed = parseAwsJson<unknown[]>(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const p = item as Record<string, unknown>;
      const label = typeof p.label === 'string' ? p.label.trim() : '';
      const serviceCategory =
        typeof p.serviceCategory === 'string' ? p.serviceCategory.trim() : '';
      if (!label && !serviceCategory) return null;
      return {
        serviceCategory: serviceCategory || 'other',
        label: label || serviceCategory,
        currency: typeof p.currency === 'string' ? p.currency : 'HKD',
        amountMin: typeof p.amountMin === 'number' ? p.amountMin : null,
        amountMax: typeof p.amountMax === 'number' ? p.amountMax : null,
        unit: typeof p.unit === 'string' ? p.unit : null,
        includesTravel: typeof p.includesTravel === 'boolean' ? p.includesTravel : null,
        rawText: typeof p.rawText === 'string' ? p.rawText : null,
        notes: typeof p.notes === 'string' ? p.notes : null,
      } satisfies HomeVisitPricingItem;
    })
    .filter(Boolean) as HomeVisitPricingItem[];
}

function getHoursSummary(
  availableHours: ApiHomeVisitProvider['availableHours'] | undefined,
  language: string = 'zh',
): string {
  if (!availableHours) return '';
  const other = availableHours.otherConditions?.trim();
  if (other) return localizeOpeningHoursText(other, language);
  return '';
}

export function formatCoverageSummary(
  coverage: HomeVisitServiceCoverage | null | undefined,
  lang: 'zh' | 'en' = 'zh',
  fallbackDistrict?: string,
): string {
  if (!coverage) {
    return fallbackDistrict?.trim() || (lang === 'en' ? 'Coverage not listed' : '服務範圍未列出');
  }

  switch (coverage.type) {
    case 'all_hk':
      return lang === 'en' ? 'All Hong Kong' : '全港上門';
    case 'radius_km': {
      if (coverage.radiusKm != null) {
        return lang === 'en'
          ? `Within ${coverage.radiusKm} km`
          : `半徑約 ${coverage.radiusKm} 公里`;
      }
      return coverage.rawText || (lang === 'en' ? 'Local area coverage' : '附近地區覆蓋');
    }
    case 'districts': {
      const districts = coverage.districts || [];
      if (districts.length === 0) {
        return coverage.rawText || (lang === 'en' ? 'Selected districts' : '指定地區');
      }
      if (districts.length <= 3) {
        return lang === 'en'
          ? `Districts: ${districts.join(', ')}`
          : `覆蓋：${districts.join('、')}`;
      }
      const shown = districts.slice(0, 3).join(lang === 'en' ? ', ' : '、');
      return lang === 'en'
        ? `Districts: ${shown} +${districts.length - 3}`
        : `覆蓋：${shown} 等 ${districts.length} 區`;
    }
    case 'custom_text':
      return (
        coverage.rawText ||
        coverage.notes ||
        fallbackDistrict?.trim() ||
        (lang === 'en' ? 'Custom coverage' : '自訂服務範圍')
      );
    default: {
      const _exhaustive: never = coverage.type;
      return String(_exhaustive);
    }
  }
}

export function servesDistrict(
  coverage: HomeVisitServiceCoverage | null | undefined,
  district: string | null | undefined,
  providerDistrict?: string | null,
): boolean {
  if (!district?.trim()) return true;
  const target = district.trim();

  if (!coverage) {
    if (!providerDistrict) return false;
    return (
      providerDistrict.includes(target) ||
      target.includes(providerDistrict) ||
      districtBelongsToRegion(providerDistrict, getRegionFromDistrictData(target))
    );
  }

  if (coverage.type === 'all_hk') return true;

  if (coverage.type === 'districts') {
    const districts = coverage.districts || [];
    return districts.some(
      (d) =>
        d.includes(target) ||
        target.includes(d) ||
        districtBelongsToRegion(target, getRegionFromDistrictData(d)) ||
        districtBelongsToRegion(d, getRegionFromDistrictData(target)),
    );
  }

  if (coverage.type === 'radius_km' || coverage.type === 'custom_text') {
    const hay = [coverage.rawText, coverage.notes, ...(coverage.districts || [])]
      .filter(Boolean)
      .join(' ');
    if (hay.includes(target)) return true;
    if (providerDistrict) {
      return (
        providerDistrict.includes(target) ||
        target.includes(providerDistrict) ||
        districtBelongsToRegion(providerDistrict, getRegionFromDistrictData(target))
      );
    }
    return false;
  }

  return false;
}

export function servesRegion(
  coverage: HomeVisitServiceCoverage | null | undefined,
  regionKey: string | null | undefined,
  providerDistrict?: string | null,
): boolean {
  if (!regionKey || regionKey === 'Others') {
    if (regionKey === 'Others') {
      return getRegionFromDistrictData(providerDistrict) === 'Others';
    }
    return true;
  }

  if (!coverage) {
    return (
      getRegionFromDistrictData(providerDistrict) === regionKey ||
      districtBelongsToRegion(providerDistrict, regionKey)
    );
  }

  if (coverage.type === 'all_hk') return true;

  if (coverage.type === 'districts') {
    const districts = coverage.districts || [];
    if (districts.some((d) => districtBelongsToRegion(d, regionKey) || getRegionFromDistrictData(d) === regionKey)) {
      return true;
    }
    // Region-level labels sometimes appear as districts (e.g. 九龍 / 香港島)
    const regionAliases: Record<string, string[]> = {
      香港: ['香港', '香港島', '港島', 'Hong Kong', 'Hong Kong Island'],
      九龍: ['九龍', 'Kowloon'],
      新界: ['新界', 'New Territories'],
      離島: ['離島', 'Islands'],
    };
    const aliases = regionAliases[regionKey] || [];
    if (districts.some((d) => aliases.some((a) => d.includes(a) || a.includes(d)))) {
      return true;
    }
  }

  const hay = [coverage.rawText, coverage.notes].filter(Boolean).join(' ');
  if (hay) {
    const regionAliases: Record<string, string[]> = {
      香港: ['香港島', '港島', 'Hong Kong Island'],
      九龍: ['九龍', 'Kowloon'],
      新界: ['新界', 'New Territories'],
      離島: ['離島', 'Islands'],
    };
    if ((regionAliases[regionKey] || []).some((a) => hay.includes(a))) return true;
  }

  return (
    getRegionFromDistrictData(providerDistrict) === regionKey ||
    districtBelongsToRegion(providerDistrict, regionKey)
  );
}

/** Normalize WhatsApp handle / phone into a wa.me URL. */
export function getWhatsAppUrl(whatsapp: string | null | undefined): string | null {
  if (!whatsapp?.trim()) return null;
  const raw = whatsapp.trim();

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      if (url.hostname.includes('wa.me') || url.hostname.includes('whatsapp.com')) {
        return url.toString();
      }
    } catch {
      // fall through to phone normalization
    }
  }

  const digits = raw.replace(/[^\d+]/g, '');
  const normalized = digits.startsWith('+')
    ? digits.slice(1).replace(/\D/g, '')
    : digits.replace(/\D/g, '');
  if (!normalized) return null;

  // HK local numbers often omit country code
  const withCountry =
    normalized.length === 8 ? `852${normalized}` : normalized.replace(/^0+/, '');
  return `https://wa.me/${withCountry}`;
}

export function getServiceCategoryLabel(category: string, lang: 'zh' | 'en'): string {
  const key = category.trim().toLowerCase().replace(/[\s-]+/g, '_');
  const labels: Record<string, { zh: string; en: string }> = {
    home_visit: { zh: '上門診症', en: 'Home visit' },
    vaccination: { zh: '疫苗', en: 'Vaccination' },
    health_check: { zh: '健康檢查', en: 'Health check' },
    blood_test: { zh: '驗血', en: 'Blood test' },
    dental: { zh: '牙科', en: 'Dental' },
    euthanasia: { zh: '安樂死', en: 'Euthanasia' },
    emergency: { zh: '急症', en: 'Emergency' },
    surgery: { zh: '手術', en: 'Surgery' },
    grooming: { zh: '美容', en: 'Grooming' },
    pharmacy: { zh: '配藥', en: 'Pharmacy' },
    other: { zh: '其他', en: 'Other' },
  };
  return labels[key]?.[lang] || category;
}

export function getSpeciesLabel(species: string, lang: 'zh' | 'en'): string {
  const key = species.trim().toLowerCase();
  const labels: Record<string, { zh: string; en: string }> = {
    dog: { zh: '狗', en: 'Dog' },
    cat: { zh: '貓', en: 'Cat' },
    rabbit: { zh: '兔', en: 'Rabbit' },
    bird: { zh: '鳥', en: 'Bird' },
    exotic: { zh: '異寵', en: 'Exotic' },
  };
  return labels[key]?.[lang] || species;
}

export function transformHomeVisitProvider(
  api: ApiHomeVisitProvider,
  language: string = 'zh',
): HomeVisitProvider {
  const lang: 'zh' | 'en' = language === 'en' ? 'en' : 'zh';
  const district = api.district?.trim() || '';
  const regionKey = getRegionFromDistrictData(district);
  const serviceCoverage = parseServiceCoverage(api.serviceCoverage);
  const services = parseServices(api.services);
  const pricing = parsePricing(api.pricing);
  const availableHours = api.availableHours || undefined;
  const serviceOfferings = api.serviceOfferings
    ? api.serviceOfferings.split(',').map((s) => s.trim()).filter(Boolean)
    : services
        .map((s) => getMultilingualString(s.name, lang) || getServiceCategoryLabel(s.category, lang))
        .filter(Boolean);

  return {
    id: api.id,
    name:
      getMultilingualString(api.name, lang) ||
      (lang === 'en' ? 'Unnamed provider' : '未命名服務'),
    region: regionKey,
    regionKey,
    district,
    address: getMultilingualString(api.address, lang),
    phone: api.phoneNo?.trim() || '',
    email: api.email || undefined,
    website: api.website || undefined,
    whatsapp: api.whatsapp || undefined,
    bookingUrl: api.bookingUrl || undefined,
    instagram: api.instagram || undefined,
    facebook: api.facebook || undefined,
    description: getMultilingualString(api.description, lang),
    serviceOfferings,
    services,
    pricing,
    serviceCoverage,
    coverageSummary: formatCoverageSummary(serviceCoverage, lang, district),
    speciesServed: (api.speciesServed || [])
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean),
    availableHours,
    hoursSummary: getHoursSummary(availableHours, lang) || undefined,
    is247: api.is247 === true,
    homeVisitConfirmed: api.homeVisitConfirmed !== false,
    image: api.coverPhoto || undefined,
    gallery: (api.gallery || []).filter(Boolean) as string[],
    verified: api.verified === true,
    rating: typeof api.totalRating === 'number' ? api.totalRating : 0,
    totalReviews: typeof api.numReviews === 'number' ? api.numReviews : 0,
    location: api.location || null,
    hasData: true,
  };
}

export async function fetchAllHomeVisitProviders(
  language: string = 'zh',
): Promise<HomeVisitProvider[]> {
  const allItems: ApiHomeVisitProvider[] = [];
  let nextToken: string | null = null;

  do {
    const result = await graphqlQuery<{
      listHomeVisitProviders: {
        items: Array<ApiHomeVisitProvider | null>;
        nextToken?: string | null;
      };
    }>(LIST_HOME_VISIT_PROVIDERS_QUERY, { limit: LIST_PAGE_SIZE, nextToken });

    for (const item of result.listHomeVisitProviders.items || []) {
      if (item?.id) allItems.push(item);
    }
    nextToken = result.listHomeVisitProviders.nextToken ?? null;
  } while (nextToken);

  return allItems.map((item) => transformHomeVisitProvider(item, language));
}

export async function fetchHomeVisitProviderById(id: string): Promise<ApiHomeVisitProvider> {
  const result = await graphqlQuery<{ getHomeVisitProvider: ApiHomeVisitProvider | null }>(
    GET_HOME_VISIT_PROVIDER_QUERY,
    { id },
  );
  if (!result.getHomeVisitProvider) {
    throw new Error('Home visit provider not found');
  }
  return result.getHomeVisitProvider;
}

export function filterHomeVisitProviders(
  providers: HomeVisitProvider[],
  filters: HomeVisitListingFilters = {},
): HomeVisitProvider[] {
  const keyword = filters.keyword?.trim().toLowerCase();
  const regionKey =
    filters.region && filters.region !== 'all'
      ? mapFilterToRegionKey(filters.region)
      : null;
  const species = filters.species?.trim().toLowerCase();
  const serviceCategory = filters.serviceCategory?.trim().toLowerCase();
  const district = filters.district?.trim();

  return providers.filter((provider) => {
    if (regionKey) {
      if (!servesRegion(provider.serviceCoverage, regionKey, provider.district)) {
        return false;
      }
    }

    if (district && !servesDistrict(provider.serviceCoverage, district, provider.district)) {
      return false;
    }

    if (filters.is247 && !provider.is247) return false;

    if (species) {
      const hasSpecies =
        provider.speciesServed.includes(species) ||
        provider.services.some((s) => s.species?.includes(species));
      if (!hasSpecies) return false;
    }

    if (serviceCategory) {
      const hasCategory =
        provider.services.some(
          (s) => s.category.toLowerCase().replace(/[\s-]+/g, '_') === serviceCategory,
        ) ||
        provider.serviceOfferings.some((s) =>
          s.toLowerCase().includes(serviceCategory.replace(/_/g, ' ')),
        ) ||
        provider.pricing.some(
          (p) =>
            p.serviceCategory.toLowerCase().replace(/[\s-]+/g, '_') === serviceCategory,
        );
      if (!hasCategory) return false;
    }

    if (keyword) {
      const hay = [
        provider.name,
        provider.district,
        provider.address,
        provider.coverageSummary,
        provider.description,
        provider.serviceOfferings.join(' '),
        provider.speciesServed.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(keyword)) return false;
    }

    return true;
  });
}
