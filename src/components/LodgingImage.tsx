import { useState } from "react";
import { useRestaurantImage } from "@/hooks/useRestaurantImage";
import { Skeleton } from "@/components/ui/skeleton";
import { Home } from "lucide-react";

interface LodgingImageProps {
  imageKey: string | undefined;
  alt: string;
  className?: string;
}

export function LodgingImage({ imageKey, alt, className = "" }: LodgingImageProps) {
  const { imageUrl, isLoading, error } = useRestaurantImage(imageKey);
  const [imgError, setImgError] = useState(false);

  const Placeholder = () => (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 ${className}`}
    >
      <Home className="h-10 w-10 text-primary/40" />
    </div>
  );

  if (!imageKey) return <Placeholder />;
  if (isLoading) return <Skeleton className={`h-full w-full ${className}`} />;
  if (error || !imageUrl || imgError) return <Placeholder />;

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`block h-full w-full object-cover ${className}`}
      onError={() => setImgError(true)}
    />
  );
}
