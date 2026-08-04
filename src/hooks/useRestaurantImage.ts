import { useState, useEffect } from 'react';
import { getImageUrl } from '@/services/s3Clients';

const S3_BUCKET = 'petwell-prod-store';

/**
 * Check if a string is a valid public URL
 */
function isPublicUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Hook to get a displayable image URL for a restaurant
 * Handles both public URLs and S3 keys. Signed URLs are cached in s3Clients.
 */
export function useRestaurantImage(imageKey: string | undefined): {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
} {
  const [imageUrl, setImageUrl] = useState<string | null>(() => {
    if (!imageKey) return null;
    return isPublicUrl(imageKey) ? imageKey : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (!imageKey) return false;
    return !isPublicUrl(imageKey);
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!imageKey) {
      setImageUrl(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // If it's already a public URL (http/https), use it directly
    if (isPublicUrl(imageKey)) {
      setImageUrl(imageKey);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Otherwise, it's an S3 key - fetch the signed URL (cached / deduped in getImageUrl)
    const fetchSignedUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getImageUrl<{ url: string }>(S3_BUCKET, imageKey);
        if (cancelled) return;
        if (response.ok && response.data?.url) {
          setImageUrl(response.data.url);
        } else {
          setError(response.error || 'Failed to load image');
          setImageUrl(null);
        }
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setImageUrl(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchSignedUrl();

    return () => {
      cancelled = true;
    };
  }, [imageKey]);

  return { imageUrl, isLoading, error };
}
