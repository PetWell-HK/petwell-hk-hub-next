import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchSalonById,
  getSalonSearchNextPageParam,
  searchSalons,
  type Salon,
} from '@/services/salonApi';
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

export function useSalons(language: string = 'zh') {
  return useQuery({
    queryKey: ['salons', 'home', PLACE_SEARCH_BACKEND, language],
    queryFn: async () => {
      const { salons } = await searchSalons(
        { limit: PLACE_SEARCH_PAGE_SIZE, sortMethod: 'rating-desc' },
        language,
      );
      return salons;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFilteredSalons(filters: PlaceListingFilters, language: string = 'zh') {
  const searchRegion = getPlaceSearchRegionParam(filters.region);
  const searchKeyword = filters.keyword?.trim() || undefined;

  const query = useInfiniteQuery({
    queryKey: ['salons', 'search', PLACE_SEARCH_BACKEND, language, searchRegion, searchKeyword, filters.is247],
    queryFn: ({ pageParam }) =>
      searchSalons(
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
    getNextPageParam: (lastPage) => getSalonSearchNextPageParam(lastPage.nextToken),
    staleTime: 5 * 60 * 1000,
  });

  const salons = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return dedupePlaceSearchPages(pages.map((page) => page.salons));
  }, [query.data]);

  const hasNextPage = useMemo(() => {
    const pages = query.data?.pages;
    if (!pages?.length) {
      return false;
    }

    const lastPage = pages[pages.length - 1];
    if (!getSalonSearchNextPageParam(lastPage?.nextToken)) {
      return false;
    }

    if (hasStuckPlaceSearchPagination(pages.map((page) => ({ items: page.salons, nextToken: page.nextToken })))) {
      return false;
    }

    return query.hasNextPage;
  }, [query.data, query.hasNextPage]);

  const totalCount = hasNextPage
    ? salons.length
    : (query.data?.pages[0]?.total ?? salons.length);

  return {
    salons,
    totalCount,
    isLoading: query.isLoading,
    error: query.error,
    hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

export function useSalon(id: string | undefined) {
  return useQuery({
    queryKey: ['salon', id],
    queryFn: () => {
      if (!id) throw new Error('Salon ID is required');
      return fetchSalonById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
