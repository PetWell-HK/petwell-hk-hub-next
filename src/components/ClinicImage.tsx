import { useState } from 'react';
import { useRestaurantImage } from '@/hooks/useRestaurantImage';
import { Skeleton } from '@/components/ui/skeleton';
import { Stethoscope } from 'lucide-react';

interface ClinicImageProps {
  imageKey: string | undefined;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain';
}

export function ClinicImage({
  imageKey,
  alt,
  className = '',
  objectFit = 'cover',
}: ClinicImageProps) {
  const { imageUrl, isLoading, error } = useRestaurantImage(imageKey);
  const [imgError, setImgError] = useState(false);
  const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';

  const Placeholder = () => (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 ${className}`}>
      <Stethoscope className="h-10 w-10 text-primary/40" />
    </div>
  );

  if (!imageKey) return <Placeholder />;
  if (isLoading) return <Skeleton className={`h-full w-full ${className}`} />;
  if (error || !imageUrl || imgError) return <Placeholder />;

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`block h-full w-full ${fitClass} ${className}`}
      onError={() => setImgError(true)}
    />
  );
}
