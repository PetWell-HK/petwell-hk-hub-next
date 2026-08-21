import AppLink from "@/components/AppLink";
import { ChevronLeft } from "lucide-react";
import { RestaurantImage } from "@/components/RestaurantImage";

interface RestaurantDetailHeroProps {
  backLabel: string;
  coverImageKey?: string;
  gallery?: string[];
  name: string;
  layout?: "mobile" | "desktop";
}

export function RestaurantDetailHero({
  backLabel,
  coverImageKey,
  gallery,
  name,
  layout = "mobile",
}: RestaurantDetailHeroProps) {
  const images = gallery?.length ? gallery : coverImageKey ? [coverImageKey] : [];
  const primary = coverImageKey || images[0];
  const extras = images.filter((img) => img !== primary).slice(0, 4);

  const isDesktop = layout === "desktop";
  const heroShell = isDesktop
    ? "restaurant-hero restaurant-hero--desktop rounded-xl"
    : "restaurant-hero";
  const mediaShell = isDesktop
    ? "restaurant-hero-media restaurant-hero-media--desktop"
    : "restaurant-hero-media restaurant-hero-media--mobile";

  if (!primary) {
    return (
      <div className={heroShell}>
        <AppLink href="/restaurants" className="restaurant-hero-back" aria-label={backLabel}>
          <ChevronLeft className="h-5 w-5" />
        </AppLink>
        <div
          className={`${mediaShell} flex items-center justify-center bg-muted text-sm text-muted-foreground`}
        >
          No photo
        </div>
      </div>
    );
  }

  if (extras.length >= 2) {
    return (
      <div className={heroShell}>
        <AppLink href="/restaurants" className="restaurant-hero-back" aria-label={backLabel}>
          <ChevronLeft className="h-5 w-5" />
        </AppLink>
        <div
          className={
            isDesktop
              ? "restaurant-hero-media restaurant-hero-media--desktop grid grid-cols-4 grid-rows-2 gap-0.5 md:gap-1"
              : "restaurant-hero-media grid min-h-[220px] grid-cols-4 grid-rows-2 gap-0.5 sm:min-h-[280px] sm:h-[280px] md:h-[380px] md:gap-1"
          }
        >
          <div className="restaurant-gallery-tile col-span-2 row-span-2">
            <RestaurantImage imageKey={primary} alt={name} className="h-full w-full" />
          </div>
          {extras.slice(0, 2).map((image, index) => (
            <div key={image} className="restaurant-gallery-tile">
              <RestaurantImage imageKey={image} alt={`${name} - ${index + 2}`} className="h-full w-full" />
            </div>
          ))}
          {extras.length >= 3 ? (
            <div className="restaurant-gallery-tile relative">
              <RestaurantImage imageKey={extras[2]} alt={`${name} - 4`} className="h-full w-full" />
              {extras.length > 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                  +{extras.length - 2}
                </div>
              )}
            </div>
          ) : (
            <div className="restaurant-gallery-tile bg-muted" />
          )}
          {extras.length >= 4 ? (
            <div className="restaurant-gallery-tile">
              <RestaurantImage imageKey={extras[3]} alt={`${name} - 5`} className="h-full w-full" />
            </div>
          ) : (
            <div className="restaurant-gallery-tile bg-muted" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={heroShell}>
      <AppLink href="/restaurants" className="restaurant-hero-back" aria-label={backLabel}>
        <ChevronLeft className="h-5 w-5" />
      </AppLink>
      <div className={`${mediaShell} restaurant-hero-media--cover`}>
        <RestaurantImage imageKey={primary} alt={name} className="h-full w-full" />
      </div>
    </div>
  );
}
