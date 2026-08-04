import { useState } from 'react';
import { useRestaurantImage } from '@/hooks/useRestaurantImage';
import { Skeleton } from '@/components/ui/skeleton';
import { UtensilsCrossed } from 'lucide-react';

interface RestaurantImageProps {
  imageKey: string | undefined;
  alt: string;
  className?: string;
}

export function RestaurantImage({ imageKey, alt, className = '' }: RestaurantImageProps) {
  const { imageUrl, isLoading, error } = useRestaurantImage(imageKey);
  const [imgError, setImgError] = useState(false);

  // Fallback placeholder
  const Placeholder = () => (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 ${className}`}>
      <UtensilsCrossed className="w-10 h-10 text-primary/40" />
    </div>
  );

  if (!imageKey) {
    return <Placeholder />;
  }

  if (isLoading) {
    return <Skeleton className={`h-full w-full ${className}`} />;
  }

  if (error || !imageUrl || imgError) {
    return <Placeholder />;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`block h-full w-full object-cover ${className}`}
      onError={() => setImgError(true)}
    />
  );
}
