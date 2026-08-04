import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAllMalls,
  fetchMallById,
  filterMalls,
  type MallListingFilters,
} from '@/services/mallApi';

export function useMalls(language: string = 'zh') {
  return useQuery({
    queryKey: ['malls', 'all', language],
    queryFn: () => fetchAllMalls(language),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFilteredMalls(filters: MallListingFilters, language: string = 'zh') {
  const query = useMalls(language);

  const malls = useMemo(() => {
    const all = query.data ?? [];
    return filterMalls(all, filters);
  }, [query.data, filters.region, filters.keyword, filters.petsAllowedYes, filters.leashWalkOk]);

  return {
    malls,
    totalCount: malls.length,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useMall(id: string | undefined) {
  return useQuery({
    queryKey: ['mall', id],
    queryFn: () => {
      if (!id) throw new Error('Mall ID is required');
      return fetchMallById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
