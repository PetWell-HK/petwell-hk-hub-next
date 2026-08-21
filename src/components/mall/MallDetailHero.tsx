import AppLink from "@/components/AppLink";
import { ChevronLeft } from "lucide-react";
import { MallImage } from "@/components/MallImage";

interface MallDetailHeroProps {
  backLabel: string;
  coverImageKey?: string;
  gallery?: string[];
  name: string;
  layout?: "mobile" | "desktop";
}

export function MallDetailHero({
  backLabel,
  coverImageKey,
  gallery,
  name,
  layout = "mobile",
}: MallDetailHeroProps) {
  const images = gallery?.length ? gallery : coverImageKey ? [coverImageKey] : [];
  const primary = coverImageKey || images[0];
  const extras = images.filter((img) => img !== primary).slice(0, 4);
  const isDesktop = layout === "desktop";

  const heroShell = isDesktop
    ? "mall-hero mall-hero--desktop rounded-xl"
    : "mall-hero";
  const mediaShell = isDesktop
    ? "mall-hero-media mall-hero-media--desktop"
    : "mall-hero-media mall-hero-media--mobile";

  if (!primary) {
    return (
      <div className={heroShell}>
        <AppLink href="/malls" className="mall-hero-back" aria-label={backLabel}>
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
        <AppLink href="/malls" className="mall-hero-back" aria-label={backLabel}>
          <ChevronLeft className="h-5 w-5" />
        </AppLink>
        <div
          className={
            isDesktop
              ? "mall-hero-media mall-hero-media--desktop grid grid-cols-4 grid-rows-2 gap-0.5 md:gap-1"
              : "mall-hero-media grid min-h-[220px] grid-cols-4 grid-rows-2 gap-0.5 sm:min-h-[280px] sm:h-[280px] md:h-[380px] md:gap-1"
          }
        >
          <div className="mall-gallery-tile col-span-2 row-span-2">
            <MallImage imageKey={primary} alt={name} className="h-full w-full" />
          </div>
          {extras.slice(0, 2).map((image, index) => (
            <div key={image} className="mall-gallery-tile">
              <MallImage imageKey={image} alt={`${name} - ${index + 2}`} className="h-full w-full" />
            </div>
          ))}
          {extras.length >= 3 ? (
            <div className="mall-gallery-tile relative">
              <MallImage imageKey={extras[2]} alt={`${name} - 4`} className="h-full w-full" />
              {extras.length > 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                  +{extras.length - 2}
                </div>
              )}
            </div>
          ) : (
            <div className="mall-gallery-tile bg-muted" />
          )}
          {extras.length >= 4 ? (
            <div className="mall-gallery-tile">
              <MallImage imageKey={extras[3]} alt={`${name} - 5`} className="h-full w-full" />
            </div>
          ) : (
            <div className="mall-gallery-tile bg-muted" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={heroShell}>
      <AppLink href="/malls" className="mall-hero-back" aria-label={backLabel}>
        <ChevronLeft className="h-5 w-5" />
      </AppLink>
      <div className={`${mediaShell} mall-hero-media--cover`}>
        <MallImage imageKey={primary} alt={name} className="h-full w-full" />
        <div className="mall-hero-veil" aria-hidden />
      </div>
    </div>
  );
}
