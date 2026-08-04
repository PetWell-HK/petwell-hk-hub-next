import { Link } from "react-router-dom";
import { MapPin, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClinicImage } from "@/components/ClinicImage";
import { PetWellVerifiedBadge } from "@/components/PetWellVerifiedBadge";
import { PremiumPartnerBadge } from "@/components/PremiumPartnerBadge";

interface PlaceListCardProps {
  name: string;
  district: string;
  address: string;
  rating: number;
  image?: string;
  verified?: boolean;
  isPremium?: boolean;
  detailPath: string;
  serviceLabels?: string[];
  openingHoursText?: string | null;
  is247?: boolean;
  is247Label?: string;
}

export function PlaceListCard({
  name,
  district,
  address,
  rating,
  image,
  verified,
  isPremium,
  detailPath,
  serviceLabels = [],
  openingHoursText,
  is247,
  is247Label,
}: PlaceListCardProps) {
  const visibleServices = serviceLabels.slice(0, 2);
  const extraServiceCount = serviceLabels.length - visibleServices.length;

  return (
    <article>
      <Link to={detailPath}>
        <Card className="h-full cursor-pointer overflow-hidden rounded-xl transition-shadow hover:shadow-strong">
          <div className="relative aspect-[4/3] overflow-hidden">
            <ClinicImage imageKey={image} alt={name} className="h-full w-full" />
            {(isPremium || verified) && (
              <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1.5">
                {isPremium && <PremiumPartnerBadge variant="onDark" />}
                {verified && <PetWellVerifiedBadge variant="onDark" />}
              </div>
            )}
          </div>

          <div className="space-y-3 p-4">
            <header>
              <h2 className="line-clamp-1 text-lg font-bold">{name}</h2>
            </header>

            {(is247 || visibleServices.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {is247 && is247Label && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    {is247Label}
                  </Badge>
                )}
                {visibleServices.map((service) => (
                  <Badge key={service} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {extraServiceCount > 0 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{extraServiceCount}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex min-w-0 items-center gap-1">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{district}</span>
              </div>
              {rating > 0 && (
                <div className="flex shrink-0 items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <address className="flex items-start gap-2 text-sm not-italic text-muted-foreground">
              <span className="line-clamp-2">{address}</span>
            </address>

            {openingHoursText && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>{openingHoursText}</span>
              </div>
            )}
          </div>
        </Card>
      </Link>
    </article>
  );
}
