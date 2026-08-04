import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchClinicById,
  getClinicSearchNextPageParam,
  searchClinics,
  type Clinic,
} from '@/services/clinicApi';
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

export function useClinics(language: string = 'zh') {
  return useQuery({
    queryKey: ['clinics', 'home', PLACE_SEARCH_BACKEND, language],
    queryFn: async () => {
      const { clinics } = await searchClinics(
        { limit: PLACE_SEARCH_PAGE_SIZE, sortMethod: 'rating-desc' },
        language,
      );
      return clinics;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFilteredClinics(filters: PlaceListingFilters, language: string = 'zh') {
  const searchRegion = getPlaceSearchRegionParam(filters.region);
  const searchKeyword = filters.keyword?.trim() || undefined;

  const query = useInfiniteQuery({
    queryKey: ['clinics', 'search', PLACE_SEARCH_BACKEND, language, searchRegion, searchKeyword, filters.is247],
    queryFn: ({ pageParam }) =>
      searchClinics(
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
    getNextPageParam: (lastPage) => getClinicSearchNextPageParam(lastPage.nextToken),
    staleTime: 5 * 60 * 1000,
  });

  const clinics = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return dedupePlaceSearchPages(pages.map((page) => page.clinics));
  }, [query.data]);

  const hasNextPage = useMemo(() => {
    const pages = query.data?.pages;
    if (!pages?.length) {
      return false;
    }

    const lastPage = pages[pages.length - 1];
    if (!getClinicSearchNextPageParam(lastPage?.nextToken)) {
      return false;
    }

    if (hasStuckPlaceSearchPagination(pages.map((page) => ({ items: page.clinics, nextToken: page.nextToken })))) {
      return false;
    }

    return query.hasNextPage;
  }, [query.data, query.hasNextPage]);

  const totalCount = hasNextPage
    ? clinics.length
    : (query.data?.pages[0]?.total ?? clinics.length);

  return {
    clinics,
    totalCount,
    isLoading: query.isLoading,
    error: query.error,
    hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

export function useClinic(id: string | undefined) {
  return useQuery({
    queryKey: ['clinic', id],
    queryFn: () => {
      if (!id) throw new Error('Clinic ID is required');
      return fetchClinicById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
