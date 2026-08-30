import { useState } from 'react';
import { useRestaurantImage } from '@/hooks/useRestaurantImage';
import { UtensilsCrossed } from 'lucide-react';

interface RestaurantImageProps {
  imageKey: string | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function RestaurantImage({
  imageKey,
  alt,
  className = '',
  priority = false,
}: RestaurantImageProps) {
  const { imageUrl, error } = useRestaurantImage(imageKey);
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

  if (error || imgError) {
    return <Placeholder />;
  }

  if (!imageUrl) {
    return <div className={`h-full w-full bg-muted/40 ${className}`} aria-hidden />;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      width={800}
      height={600}
      fetchPriority={priority ? 'high' : 'auto'}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`block h-full w-full object-cover ${className}`}
      onError={() => setImgError(true)}
    />
  );
}
