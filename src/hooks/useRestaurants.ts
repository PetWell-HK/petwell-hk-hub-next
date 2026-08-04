import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchAllRestaurants,
  fetchFehdLicensedRestaurants,
  fetchRestaurantById,
  fetchRestaurants,
  getRestaurantSearchNextPageParam,
  HOME_FEATURED_RESTAURANT_FETCH_SIZE,
  RESTAURANT_SEARCH_PAGE_SIZE,
  type Restaurant,
} from '@/services/restaurantApi';
import { mapFilterToRegionKey } from '@/data/hongKongDistricts';
import { shuffleArray } from '@/utils/shuffleArray';
import { pickFeaturedWithPremiumFirst } from '@/utils/partnerPremium';
import { isRestaurantFehdLicensed } from '@/utils/restaurantExternalMetadata';
import { PLACE_SEARCH_BACKEND } from '@/services/placeSearchConfig';
import { expandDistrictFilterValues } from '@/services/placeSearchUtils';
import { useEffect, useMemo } from 'react';

export const HOME_FEATURED_RESTAURANT_COUNT = 8;

export interface RestaurantFilters {
  region?: string;
  keyword?: string;
  is247?: boolean;
  verifiedOnly?: boolean;
  indoorAllowed?: boolean;
  walkInAllowed?: boolean;
  fehdLicensed?: boolean;
  selectedDistricts?: string[];
}

function getSearchRegionParam(filterRegion?: string): string | undefined {
  if (!filterRegion || filterRegion === 'all') {
    return undefined;
  }

  const regionKey = mapFilterToRegionKey(filterRegion);
  if (!regionKey || regionKey === 'Others') {
    return undefined;
  }

  return regionKey;
}

function getSearchDistrictParams(selectedDistricts?: string[]): {
  district?: string;
  districts?: string[];
} {
  const values = (selectedDistricts || []).map((d) => d.trim()).filter(Boolean);
  if (values.length === 0) return {};
  if (values.length === 1) return { district: values[0] };
  return { districts: values };
}

export function applyRestaurantListingFilters(
  restaurants: Restaurant[],
  filters: RestaurantFilters,
  options: { serverFiltered?: boolean } = {},
): Restaurant[] {
  let result = restaurants;

  if (filters.fehdLicensed) {
    result = result.filter((r) => isRestaurantFehdLicensed(r));
  } else if (!options.serverFiltered && filters.verifiedOnly !== false) {
    result = result.filter((r) => r.verified === true);
  }

  if (!options.serverFiltered && filters.region && filters.region !== 'all') {
    const regionKey = mapFilterToRegionKey(filters.region);
    if (regionKey && regionKey !== 'Others') {
      result = result.filter((r) => r.region === regionKey);
    } else if (regionKey === 'Others') {
      result = result.filter((r) => r.region === 'Others' || r.region === '離島');
    }
  }

  if (!options.serverFiltered && filters.selectedDistricts && filters.selectedDistricts.length > 0) {
    const expanded = expandDistrictFilterValues(filters.selectedDistricts);
    result = result.filter((r) => {
      const itemDistrict = (r.district || '').trim();
      return expanded.some((selectedDistrict: string) => {
        const selected = selectedDistrict.trim();
        if (itemDistrict === selected) return true;
        if (selected.length >= 2 && itemDistrict.includes(selected)) return true;
        if (itemDistrict.length >= 2 && selected.includes(itemDistrict)) return true;
        return false;
      });
    });
  }

  if (!options.serverFiltered && filters.keyword) {
    const query = filters.keyword.toLowerCase();
    result = result.filter((r) => {
      const name = r.name.toLowerCase();
      const address = r.address.toLowerCase();
      const district = (r.district || '').toLowerCase();
      return name.includes(query) || address.includes(query) || district.includes(query);
    });
  }

  if (!options.serverFiltered && filters.indoorAllowed) {
    result = result.filter((r) => r.petAccessArea === 'INDOOR_ALLOWED');
  }

  if (!options.serverFiltered && filters.walkInAllowed) {
    result = result.filter(
      (r) => r.petEntryPolicy === 'WALK_IN_ONLY' || r.petEntryPolicy === 'BOTH',
    );
  }

  if (!options.serverFiltered && filters.is247) {
    result = result.filter((r) => r.is247 === true);
  }

  return result;
}

function dedupeRestaurantsById(restaurants: Restaurant[]): Restaurant[] {
  const seen = new Set<string>();
  return restaurants.filter((restaurant) => {
    if (seen.has(restaurant.id)) {
      return false;
    }
    seen.add(restaurant.id);
    return true;
  });
}

function getClientListingFilters(
  filters: RestaurantFilters,
  searchKeyword?: string,
  serverFiltered?: boolean,
): RestaurantFilters {
  if (!serverFiltered && !searchKeyword) {
    return filters;
  }

  const { keyword: _keyword, ...rest } = filters;
  if (serverFiltered) {
    const {
      verifiedOnly: _verifiedOnly,
      indoorAllowed: _indoorAllowed,
      walkInAllowed: _walkInAllowed,
      selectedDistricts: _selectedDistricts,
      region: _region,
      is247: _is247,
      ...serverRest
    } = rest;
    return serverRest;
  }

  return rest;
}

export function useRestaurants(language: string = 'zh') {
  return useQuery({
    queryKey: ['restaurants', language],
    queryFn: () => fetchAllRestaurants(language),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVerifiedRestaurants(language: string = 'zh') {
  const { data: restaurants = [], isLoading, error } = useRestaurants(language);

  const verifiedRestaurants = useMemo(() => {
    return restaurants.filter((restaurant: Restaurant) => restaurant.verified === true);
  }, [restaurants]);

  return {
    restaurants: verifiedRestaurants,
    isLoading,
    error,
  };
}

/** Home page rail — one search request instead of loading the full catalog. */
export function useHomeFeaturedRestaurants(
  language: string = 'zh',
  count: number = HOME_FEATURED_RESTAURANT_COUNT,
) {
  return useQuery({
    queryKey: ['restaurants', 'homeFeatured', PLACE_SEARCH_BACKEND, language, count],
    queryFn: async () => {
      const { restaurants } = await fetchRestaurants(
        {
          limit: HOME_FEATURED_RESTAURANT_FETCH_SIZE,
          sortMethod: 'rating-desc',
          verified: true,
        },
        language,
      );
      const verified = restaurants.filter((restaurant) => restaurant.verified);
      return pickFeaturedWithPremiumFirst(verified, count, shuffleArray);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFilteredRestaurants(filters: RestaurantFilters, language: string = 'zh') {
  const searchRegion = getSearchRegionParam(filters.region);
  const { district: searchDistrict, districts: searchDistricts } = getSearchDistrictParams(
    filters.selectedDistricts,
  );
  const hasDistrictFilter = Boolean(searchDistrict || searchDistricts?.length);
  const searchKeyword = filters.keyword?.trim() || undefined;
  const useFehdList = filters.fehdLicensed === true;

  const fehdListQuery = useInfiniteQuery({
    queryKey: ['restaurants', 'fehd', language],
    queryFn: ({ pageParam }) =>
      fetchFehdLicensedRestaurants(
        { limit: RESTAURANT_SEARCH_PAGE_SIZE, nextToken: pageParam },
        language,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextToken ?? undefined,
    enabled: useFehdList,
    staleTime: 5 * 60 * 1000,
  });

  const searchQuery = useInfiniteQuery({
    queryKey: [
      'restaurants',
      'search',
      PLACE_SEARCH_BACKEND,
      language,
      searchRegion,
      searchDistrict,
      searchDistricts,
      searchKeyword,
      filters.is247,
      filters.fehdLicensed,
      filters.verifiedOnly,
      filters.indoorAllowed,
      filters.walkInAllowed,
    ],
    queryFn: ({ pageParam }) =>
      fetchRestaurants(
        {
          region: hasDistrictFilter ? undefined : searchRegion,
          district: searchDistrict,
          districts: searchDistricts,
          keyword: searchKeyword,
          is247: filters.is247,
          fehdLicensed: filters.fehdLicensed ? true : undefined,
          verified: filters.verifiedOnly !== false ? true : undefined,
          petAccessArea: filters.indoorAllowed ? 'INDOOR_ALLOWED' : undefined,
          petEntryPolicy: filters.walkInAllowed ? 'WALK_IN' : undefined,
          limit: RESTAURANT_SEARCH_PAGE_SIZE,
          nextToken: pageParam,
        },
        language,
      ),
    initialPageParam: undefined as number[] | undefined,
    getNextPageParam: (lastPage) => getRestaurantSearchNextPageParam(lastPage.nextToken),
    enabled: !useFehdList,
    staleTime: 5 * 60 * 1000,
  });

  const activeQuery = useFehdList ? fehdListQuery : searchQuery;

  const loadedRestaurants = useMemo(() => {
    const pages = useFehdList
      ? fehdListQuery.data?.pages.flatMap((page) => page.restaurants) ?? []
      : searchQuery.data?.pages.flatMap((page) => page.restaurants) ?? [];
    return dedupeRestaurantsById(pages);
  }, [useFehdList, fehdListQuery.data, searchQuery.data]);

  const clientFilters = useMemo(
    () =>
      useFehdList
        ? filters
        : getClientListingFilters(filters, searchKeyword, true),
    [filters, searchKeyword, useFehdList],
  );

  const filteredRestaurants = useMemo(
    () =>
      applyRestaurantListingFilters(loadedRestaurants, clientFilters, {
        serverFiltered: !useFehdList,
      }),
    [loadedRestaurants, clientFilters, useFehdList],
  );

  const apiTotalCount = useFehdList
    ? undefined
    : searchQuery.data?.pages[0]?.total;

  const totalCount = useFehdList
    ? filteredRestaurants.length
    : activeQuery.hasNextPage
      ? filteredRestaurants.length
      : (apiTotalCount ?? filteredRestaurants.length);

  const hasNextPage = useMemo(() => {
    if (useFehdList) {
      return fehdListQuery.hasNextPage;
    }

    const pages = searchQuery.data?.pages;
    if (!pages?.length) {
      return false;
    }

    const lastPage = pages[pages.length - 1];
    const apiNextToken = getRestaurantSearchNextPageParam(lastPage?.nextToken);
    if (!apiNextToken) {
      return false;
    }

    if (pages.length >= 2) {
      const previousIds = new Set(pages[pages.length - 2].restaurants.map((r) => r.id));
      const lastPageIds = lastPage.restaurants.map((r) => r.id);
      if (lastPageIds.length > 0 && lastPageIds.every((id) => previousIds.has(id))) {
        return false;
      }
    }

    return searchQuery.hasNextPage;
  }, [useFehdList, fehdListQuery.hasNextPage, searchQuery.data, searchQuery.hasNextPage]);

  useEffect(() => {
    if (
      useFehdList ||
      activeQuery.isLoading ||
      activeQuery.isFetchingNextPage ||
      !hasNextPage ||
      filteredRestaurants.length > 0
    ) {
      return;
    }

    activeQuery.fetchNextPage();
  }, [
    useFehdList,
    activeQuery.isLoading,
    activeQuery.isFetchingNextPage,
    hasNextPage,
    filteredRestaurants.length,
    activeQuery.fetchNextPage,
  ]);

  return {
    restaurants: filteredRestaurants,
    totalCount,
    isLoading: activeQuery.isLoading,
    error: activeQuery.error,
    hasNextPage,
    fetchNextPage: activeQuery.fetchNextPage,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
  };
}

export function useRestaurant(id: string | undefined, language: string = 'zh') {
  return useQuery({
    queryKey: ['restaurant', id, language],
    queryFn: async () => {
      if (!id) throw new Error('Restaurant ID is required');
      return fetchRestaurantById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
