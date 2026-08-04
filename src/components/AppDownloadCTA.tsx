const logo = "/assets/logo.png";
const appStoreBadge = "/assets/app-store-badge-new.png";
const googlePlayBadge = "/assets/google-play-badge-new.png";
import { assetSrc } from "@/lib/assetSrc";
import { cn } from "@/lib/utils";

export const APP_STORE_URL =
  "https://apps.apple.com/hk/app/petwell-hk/id6747191070?l=en-GB";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.bugy.petwell";

interface AppDownloadCTAProps {
  title: string;
  description?: string;
  variant?: "default" | "primary";
  className?: string;
}

export function AppDownloadCTA({
  title,
  description,
  variant = "default",
  className,
}: AppDownloadCTAProps) {
  const isPrimary = variant === "primary";

  return (
    <div className={cn("text-center", className)}>
      <img
        src={assetSrc(logo)}
        alt="PetWell"
        className={cn(
          "mx-auto mb-3 h-8 w-auto",
          isPrimary && "brightness-0 invert",
        )}
      />
      <h3
        className={cn(
          "mb-1.5 font-bold",
          isPrimary ? "text-lg text-white md:text-xl" : "text-base",
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={cn(
            "mb-4 text-sm",
            isPrimary ? "text-white/90" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
      <div className="flex flex-col items-center justify-center gap-2.5 sm:flex-row sm:gap-3">
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-[150px] transition-opacity hover:opacity-80 sm:w-[140px]"
        >
          <img
            src={appStoreBadge}
            alt="Download on the App Store"
            className="h-auto w-full object-contain"
          />
        </a>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-[150px] transition-opacity hover:opacity-80 sm:w-[140px]"
        >
          <img
            src={googlePlayBadge}
            alt="Get it on Google Play"
            className="h-auto w-full object-contain"
          />
        </a>
      </div>
    </div>
  );
}
