import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAllHomeVisitProviders,
  fetchHomeVisitProviderById,
  filterHomeVisitProviders,
  type HomeVisitListingFilters,
} from '@/services/homeVisitApi';

export function useHomeVisitProviders(language: string = 'zh') {
  return useQuery({
    queryKey: ['homeVisitProviders', 'all', language],
    queryFn: () => fetchAllHomeVisitProviders(language),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFilteredHomeVisitProviders(
  filters: HomeVisitListingFilters,
  language: string = 'zh',
) {
  const query = useHomeVisitProviders(language);

  const providers = useMemo(() => {
    const all = query.data ?? [];
    return filterHomeVisitProviders(all, filters);
  }, [
    query.data,
    filters.region,
    filters.district,
    filters.keyword,
    filters.species,
    filters.serviceCategory,
    filters.is247,
  ]);

  return {
    providers,
    totalCount: providers.length,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useHomeVisitProvider(id: string | undefined) {
  return useQuery({
    queryKey: ['homeVisitProvider', id],
    queryFn: () => {
      if (!id) throw new Error('Home visit provider ID is required');
      return fetchHomeVisitProviderById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
