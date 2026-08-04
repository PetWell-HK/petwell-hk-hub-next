import { useQuery } from '@tanstack/react-query';
import { fetchNearbyRestaurants } from '@/services/restaurantApi';
import { PLACE_SEARCH_BACKEND } from '@/services/placeSearchConfig';

export function useNearbyRestaurants(
  eventLat: number | undefined,
  eventLon: number | undefined,
  language: string = 'zh',
  maxDistanceKm: number = 5
) {
  return useQuery({
    queryKey: ['nearbyRestaurants', PLACE_SEARCH_BACKEND, eventLat, eventLon, language, maxDistanceKm],
    queryFn: () => fetchNearbyRestaurants(eventLat!, eventLon!, language, maxDistanceKm),
    enabled: !!eventLat && !!eventLon,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
