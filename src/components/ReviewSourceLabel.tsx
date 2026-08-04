import { useTranslation } from "react-i18next";
import { GoogleLogo } from "@/components/brand/PlatformLogos";
import { isPetWellSource } from "@/utils/reviewDisplay";

function normalizeSource(source?: string | null): string {
  return (source || "").trim().toLowerCase();
}

function isGoogleSource(source?: string | null): boolean {
  const normalized = normalizeSource(source);
  return normalized === "google" || normalized.includes("google");
}

interface ReviewSourceLabelProps {
  source?: string | null;
  className?: string;
}

export function ReviewSourceLabel({ source, className = "" }: ReviewSourceLabelProps) {
  const { t } = useTranslation();

  // PetWell reviews are first-party — do not label them as external.
  if (isPetWellSource(source)) {
    return null;
  }

  if (isGoogleSource(source)) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[11px] leading-none text-muted-foreground ${className}`}
      >
        <GoogleLogo className="h-3 w-3 shrink-0" />
        <span>{t("reviews.fromGoogle")}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      {t("reviews.externalUserFrom", { source: source?.trim() || "petahood" })}
    </span>
  );
}
