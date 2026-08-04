import {
  dynamoClinicSearchQuery,
  dynamoLodgingSearchQuery,
  dynamoRestaurantFullSearchQuery,
  dynamoRestaurantListingSearchQuery,
  dynamoSalonSearchQuery,
  verboseClinicSearchQuery,
  verboseLodgingSearchQuery,
  verboseRestaurantFullSearchQuery,
  verboseRestaurantListingSearchQuery,
  verboseSalonSearchQuery,
} from '@/graphql/placeSearchQueries';
import { getPublicEnv } from '@/lib/env';

export type PlaceSearchBackend = 'opensearch' | 'dynamo';

export type PlaceSearchType = 'clinic' | 'salon' | 'lodging' | 'restaurant';

/** Default dynamo (GSI + geohash) unless explicitly set to opensearch for rollback. */
export const PLACE_SEARCH_BACKEND: PlaceSearchBackend =
  getPublicEnv('VITE_PLACE_SEARCH_BACKEND') === 'opensearch' ? 'opensearch' : 'dynamo';

export function isDynamoPlaceSearch(): boolean {
  return PLACE_SEARCH_BACKEND === 'dynamo';
}

interface PlaceSearchQueryConfig {
  query: string;
  key: string;
  backend: PlaceSearchBackend;
}

interface GetPlaceSearchQueryConfigOptions {
  fullFields?: boolean;
}

const CLINIC_SALON_LODGING_MAP = {
  clinic: {
    opensearch: { query: verboseClinicSearchQuery, key: 'verboseClinicSearch' },
    dynamo: { query: dynamoClinicSearchQuery, key: 'dynamoClinicSearch' },
  },
  salon: {
    opensearch: { query: verboseSalonSearchQuery, key: 'verboseSalonSearch' },
    dynamo: { query: dynamoSalonSearchQuery, key: 'dynamoSalonSearch' },
  },
  lodging: {
    opensearch: { query: verboseLodgingSearchQuery, key: 'verboseLodgingSearch' },
    dynamo: { query: dynamoLodgingSearchQuery, key: 'dynamoLodgingSearch' },
  },
} as const;

export function getPlaceSearchQueryConfig(
  placeType: PlaceSearchType,
  options: GetPlaceSearchQueryConfigOptions = {},
): PlaceSearchQueryConfig {
  if (placeType === 'restaurant') {
    const useFullFields = options.fullFields === true;

    if (PLACE_SEARCH_BACKEND === 'dynamo') {
      return {
        query: useFullFields
          ? dynamoRestaurantFullSearchQuery
          : dynamoRestaurantListingSearchQuery,
        key: 'dynamoRestaurantSearch',
        backend: PLACE_SEARCH_BACKEND,
      };
    }

    return {
      query: useFullFields
        ? verboseRestaurantFullSearchQuery
        : verboseRestaurantListingSearchQuery,
      key: 'verboseRestaurantSearch',
      backend: PLACE_SEARCH_BACKEND,
    };
  }

  const byBackend = CLINIC_SALON_LODGING_MAP[placeType];
  const config = byBackend[PLACE_SEARCH_BACKEND];
  return {
    ...config,
    backend: PLACE_SEARCH_BACKEND,
  };
}
