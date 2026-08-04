import { parseRestaurantExternalMetadata } from '@/utils/restaurantExternalMetadata';

export function getRestaurantCombinedRating(input: {
  totalRating?: number | null;
  externalMetadata?: unknown;
  combinedRating?: number | null;
}): number | null {
  const { totalRating, externalMetadata, combinedRating } = input;

  if (typeof combinedRating === 'number' && Number.isFinite(combinedRating) && combinedRating > 0) {
    return combinedRating;
  }

  const meta = parseRestaurantExternalMetadata(externalMetadata);
  const scores: number[] = [];

  const google = meta?.ratings?.google?.score;
  const openrice = meta?.ratings?.openrice?.score;

  if (typeof google === 'number' && Number.isFinite(google) && google > 0) scores.push(google);
  if (typeof openrice === 'number' && Number.isFinite(openrice) && openrice > 0) scores.push(openrice);
  if (typeof totalRating === 'number' && Number.isFinite(totalRating) && totalRating > 0) {
    scores.push(totalRating);
  }

  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function formatRestaurantCombinedRating(rating: number | null | undefined): string | null {
  if (typeof rating !== 'number' || !Number.isFinite(rating) || rating <= 0) return null;
  return rating.toFixed(1);
}
