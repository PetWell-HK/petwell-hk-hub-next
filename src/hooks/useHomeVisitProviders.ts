import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAllHomeVisitProviders,
  fetchHomeVisitProviderById,
  filterHomeVisitProviders,
  sortHomeVisitProvidersPricedThenRandom,
  type ApiHomeVisitProvider,
  type HomeVisitListingFilters,
  type HomeVisitProvider,
} from '@/services/homeVisitApi';

export function useHomeVisitProviders(
  language: string = 'zh',
  initialData?: HomeVisitProvider[] | null,
) {
  return useQuery({
    queryKey: ['homeVisitProviders', 'all', language],
    queryFn: () => fetchAllHomeVisitProviders(language),
    staleTime: 5 * 60 * 1000,
    initialData: initialData ?? undefined,
  });
}

export function useFilteredHomeVisitProviders(
  filters: HomeVisitListingFilters,
  language: string = 'zh',
  initialProviders?: HomeVisitProvider[] | null,
) {
  const query = useHomeVisitProviders(language, initialProviders);
  const shuffleSeedRef = useRef(1);

  const providers = useMemo(() => {
    const filtered = filterHomeVisitProviders(query.data ?? [], filters);
    return sortHomeVisitProvidersPricedThenRandom(filtered, shuffleSeedRef.current);
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

export function useHomeVisitProvider(
  id: string | undefined,
  initialData?: ApiHomeVisitProvider | null,
) {
  return useQuery({
    queryKey: ['homeVisitProvider', id],
    queryFn: () => {
      if (!id) throw new Error('Home visit provider ID is required');
      return fetchHomeVisitProviderById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: initialData ?? undefined,
  });
}
