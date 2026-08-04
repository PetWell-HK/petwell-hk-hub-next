import { mapFilterToRegionKey } from '@/data/hongKongDistricts';
import { graphqlQuery } from '@/services/graphqlClient';
import {
  getPlaceSearchQueryConfig,
  type PlaceSearchType,
} from '@/services/placeSearchConfig';

export const HK_CENTER = { lat: 22.3193, lon: 114.1694 };

export const PLACE_SEARCH_PAGE_SIZE = 48;

export interface PlaceSearchOptions {
  region?: string;
  district?: string;
  districts?: string[];
  keyword?: string;
  is247?: boolean;
  limit?: number;
  nextToken?: number[];
  sortMethod?: 'rating-desc' | 'location';
}

export function formatGraphqlError(error: unknown, fallback = 'Search failed'): string {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  const err = error as {
    errors?: Array<{ message?: string; errorType?: string }>;
    message?: { errors?: Array<{ message?: string; errorType?: string }> } | string;
  };

  const nestedErrors =
    err.errors ||
    (typeof err.message === 'object' && err.message?.errors) ||
    (Array.isArray(error) ? (error as Array<{ message?: string }>) : null);

  if (Array.isArray(nestedErrors) && nestedErrors.length > 0) {
    const messages = nestedErrors
      .map((entry) => entry?.message)
      .filter((message): message is string => typeof message === 'string' && message.length > 0);
    if (messages.length > 0) {
      return messages.join('; ');
    }
  }

  if (typeof err.message === 'string' && err.message.length > 0 && err.message !== '[object Object]') {
    return err.message;
  }

  return fallback;
}

export function isOpenSearchIndexMissingError(error: unknown): boolean {
  const message = formatGraphqlError(error, '').toLowerCase();
  const err = error as {
    errors?: Array<{ errorType?: string }>;
    message?: { errors?: Array<{ errorType?: string }> };
  };
  const errorType =
    err.errors?.[0]?.errorType || err.message?.errors?.[0]?.errorType || '';

  return (
    message.includes('not found') ||
    message.includes('index_not_found') ||
    String(errorType).toLowerCase().includes('notfound')
  );
}

export function isPlaceSearchLambdaMissingError(error: unknown): boolean {
  const message = formatGraphqlError(error, '').toLowerCase();
  const err = error as {
    errors?: Array<{ errorType?: string }>;
    message?: { errors?: Array<{ errorType?: string }> };
  };
  const errorType =
    err.errors?.[0]?.errorType || err.message?.errors?.[0]?.errorType || '';

  return (
    message.includes('function not found') ||
    message.includes('placesearch-prod') ||
    String(errorType).toLowerCase().includes('resourcenotfound')
  );
}

export function getPlaceSearchLambdaMissingMessage(): string {
  return 'Dynamo place search is not deployed yet. Run amplify push to create placeSearch-prod, then retry.';
}

interface RunPlaceSearchOptions {
  fullFields?: boolean;
  fallback?: string;
}

interface PlaceSearchResult<TItem> {
  items: TItem[];
  total: number;
  nextToken: number[] | null;
}

export async function runPlaceSearch<TItem>(
  placeType: PlaceSearchType,
  variables: Record<string, unknown>,
  options: RunPlaceSearchOptions = {},
): Promise<PlaceSearchResult<TItem>> {
  const { query, key, backend } = getPlaceSearchQueryConfig(placeType, options);
  const fallback = options.fallback ?? 'Search failed';

  try {
    const result = await graphqlQuery<
      Record<string, { items?: TItem[]; total?: number; nextToken?: number[] | null }>
    >(query, variables);

    const payload = result[key];
    return {
      items: payload?.items ?? [],
      total: payload?.total ?? 0,
      nextToken: normalizePlaceSearchNextToken(payload?.nextToken),
    };
  } catch (error) {
    if (backend === 'dynamo' && isPlaceSearchLambdaMissingError(error)) {
      throw new Error(getPlaceSearchLambdaMissingMessage());
    }
    if (backend === 'opensearch' && isOpenSearchIndexMissingError(error)) {
      throw new Error(
        'Place search index is not ready yet. Please wait a few minutes after deployment.',
      );
    }
    throw new Error(formatGraphqlError(error, fallback));
  }
}

/** Neighborhood <-> admin-district aliases for filter matching. */
const DISTRICT_FILTER_ALIASES: Record<string, readonly string[]> = {
  元朗: ['元朗區'],
  元朗區: ['元朗'],
  荃灣: ['荃灣區'],
  荃灣區: ['荃灣'],
  屯門: ['屯門區'],
  屯門區: ['屯門'],
  大埔: ['大埔區'],
  大埔區: ['大埔'],
  沙田: ['沙田區'],
  沙田區: ['沙田'],
  西貢: ['西貢區'],
  西貢區: ['西貢'],
  深水埗: ['深水埗區'],
  深水埗區: ['深水埗'],
  九龍城: ['九龍城區'],
  九龍城區: ['九龍城'],
  觀塘: ['觀塘區'],
  觀塘區: ['觀塘'],
  黃大仙: ['黃大仙區'],
  黃大仙區: ['黃大仙'],
  灣仔: ['灣仔區'],
  灣仔區: ['灣仔'],
  離島: ['離島區'],
  離島區: ['離島'],
};

export function expandDistrictFilterValues(
  selectedDistricts: string[] | null | undefined,
): string[] {
  if (!selectedDistricts?.length) return [];
  const expanded = new Set<string>();
  for (const raw of selectedDistricts) {
    const value = raw?.trim();
    if (!value) continue;
    expanded.add(value);
    const aliases = DISTRICT_FILTER_ALIASES[value];
    if (aliases) {
      for (const alias of aliases) expanded.add(alias);
    }
  }
  return Array.from(expanded);
}

export function applyPlaceDistrictSearchVariables(
  variables: Record<string, unknown>,
  options: Pick<PlaceSearchOptions, 'region' | 'district' | 'districts'>,
): void {
  const seed = [
    ...(options.districts || []),
    ...(options.district ? [options.district] : []),
  ];
  const trimmedDistricts = expandDistrictFilterValues(seed);

  if (trimmedDistricts.length > 1) {
    variables.districts = trimmedDistricts;
    return;
  }

  const singleDistrict = trimmedDistricts[0];
  if (singleDistrict) {
    variables.district = singleDistrict;
    return;
  }

  if (options.region && options.region !== 'All') {
    variables.region = options.region;
  }
}

export function getPlaceSearchRegionParam(filterRegion?: string): string | undefined {
  if (!filterRegion || filterRegion === 'all') {
    return undefined;
  }

  const regionKey = mapFilterToRegionKey(filterRegion);
  if (!regionKey || regionKey === 'Others') {
    return undefined;
  }

  return regionKey;
}

export function normalizePlaceSearchNextToken(
  nextToken: number[] | null | undefined,
): number[] | null {
  if (!nextToken || !Array.isArray(nextToken) || nextToken.length === 0) {
    return null;
  }

  const normalized = nextToken
    .filter(
      (val) =>
        typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val))),
    )
    .map((val) => (typeof val === 'string' ? parseFloat(val) : val));

  return normalized.length > 0 ? normalized : null;
}

export function getPlaceSearchNextPageParam(
  nextToken: number[] | null | undefined,
): number[] | undefined {
  return normalizePlaceSearchNextToken(nextToken) ?? undefined;
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

export function dedupePlaceSearchPages<T extends { id: string }>(pages: T[][]): T[] {
  return dedupeById(pages.flat());
}

export function hasStuckPlaceSearchPagination<T extends { id: string }>(
  pages: Array<{ items: T[]; nextToken?: number[] | null }>,
): boolean {
  if (pages.length < 2) {
    return false;
  }

  const lastPage = pages[pages.length - 1];
  const previousIds = new Set(pages[pages.length - 2].items.map((item) => item.id));
  const lastPageIds = lastPage.items.map((item) => item.id);

  return (
    lastPageIds.length > 0 && lastPageIds.every((id) => previousIds.has(id))
  );
}
