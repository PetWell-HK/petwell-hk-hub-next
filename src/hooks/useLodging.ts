import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchLodgingById,
  getLodgingSearchNextPageParam,
  searchLodgings,
  type Lodging,
} from '@/services/lodgingApi';
import {
  dedupePlaceSearchPages,
  getPlaceSearchRegionParam,
  hasStuckPlaceSearchPagination,
  PLACE_SEARCH_PAGE_SIZE,
} from '@/services/placeSearchUtils';
import { PLACE_SEARCH_BACKEND } from '@/services/placeSearchConfig';
import { useMemo } from 'react';

export interface PlaceListingFilters {
  region?: string;
  keyword?: string;
  is247?: boolean;
}

export function useLodgings(language: string = 'zh') {
  return useQuery({
    queryKey: ['lodgings', 'home', PLACE_SEARCH_BACKEND, language],
    queryFn: async () => {
      const { lodgings } = await searchLodgings(
        { limit: PLACE_SEARCH_PAGE_SIZE, sortMethod: 'rating-desc' },
        language,
      );
      return lodgings;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFilteredLodgings(filters: PlaceListingFilters, language: string = 'zh') {
  const searchRegion = getPlaceSearchRegionParam(filters.region);
  const searchKeyword = filters.keyword?.trim() || undefined;

  const query = useInfiniteQuery({
    queryKey: ['lodgings', 'search', PLACE_SEARCH_BACKEND, language, searchRegion, searchKeyword, filters.is247],
    queryFn: ({ pageParam }) =>
      searchLodgings(
        {
          region: searchRegion,
          keyword: searchKeyword,
          is247: filters.is247,
          limit: PLACE_SEARCH_PAGE_SIZE,
          nextToken: pageParam,
        },
        language,
      ),
    initialPageParam: undefined as number[] | undefined,
    getNextPageParam: (lastPage) => getLodgingSearchNextPageParam(lastPage.nextToken),
    staleTime: 5 * 60 * 1000,
  });

  const lodgings = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return dedupePlaceSearchPages(pages.map((page) => page.lodgings));
  }, [query.data]);

  const hasNextPage = useMemo(() => {
    const pages = query.data?.pages;
    if (!pages?.length) {
      return false;
    }

    const lastPage = pages[pages.length - 1];
    if (!getLodgingSearchNextPageParam(lastPage?.nextToken)) {
      return false;
    }

    if (hasStuckPlaceSearchPagination(pages.map((page) => ({ items: page.lodgings, nextToken: page.nextToken })))) {
      return false;
    }

    return query.hasNextPage;
  }, [query.data, query.hasNextPage]);

  const totalCount = hasNextPage
    ? lodgings.length
    : (query.data?.pages[0]?.total ?? lodgings.length);

  return {
    lodgings,
    totalCount,
    isLoading: query.isLoading,
    error: query.error,
    hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

export function useLodging(id: string | undefined) {
  return useQuery({
    queryKey: ['lodging', id],
    queryFn: () => {
      if (!id) throw new Error('Lodging ID is required');
      return fetchLodgingById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
