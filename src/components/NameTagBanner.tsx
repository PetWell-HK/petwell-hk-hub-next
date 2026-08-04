import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

const REGISTRATION_PROGRESS = 78;

/** Hide on offer / tag flows where the banner is redundant. */
const SUPPRESSED_PREFIXES = [
  "/nametag",
  "/namtag",
  "/fang-zou-shi-gou-pai",
  "/anti-lost-dog-tag-hk",
  "/防走失狗牌",
  "/activate/",
  "/pet/",
  "/check/",
] as const;

function isSuppressedPath(pathname: string): boolean {
  return SUPPRESSED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}

const NameTagBanner = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  if (isSuppressedPath(pathname)) {
    return null;
  }

  return (
    <div
      className="nametag-promo-banner border-b border-border/50 bg-[hsl(28_32%_97%)]"
      role="region"
      aria-label={t("nameTagBanner.ariaLabel")}
    >
      <div className="container mx-auto flex min-h-8 items-center justify-between gap-3 px-4 py-1 sm:min-h-9 sm:py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <span className="inline-flex shrink-0 items-center gap-1 rounded border border-primary/12 bg-primary/[0.05] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-primary/90 sm:px-2 sm:text-[11px]">
            <Tag className="h-3 w-3 opacity-80" aria-hidden />
            {t("nameTagBanner.badge")}
          </span>
          <p className="min-w-0 truncate text-[11px] leading-snug text-foreground/90 sm:text-xs">
            <span className="font-medium">{t("nameTagBanner.title")}</span>
            <span className="hidden text-muted-foreground lg:inline">
              {" "}
              · {t("nameTagBanner.subtitle")}
            </span>
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <span className="text-[10px] text-muted-foreground/90">{t("nameTagBanner.progressLabel")}</span>
          <div
            className="h-1 w-12 overflow-hidden rounded-full bg-border/70 sm:w-14"
            role="progressbar"
            aria-valuenow={REGISTRATION_PROGRESS}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("nameTagBanner.progressLabel")}
          >
            <div
              className="h-full rounded-full bg-primary/65 transition-[width] duration-700 ease-out"
              style={{ width: `${REGISTRATION_PROGRESS}%` }}
            />
          </div>
          <span className="w-7 text-right text-[10px] font-medium tabular-nums text-muted-foreground/90">
            {REGISTRATION_PROGRESS}%
          </span>
        </div>

        <Link
          to="/anti-lost-dog-tag-hk"
          className="group inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-primary/90 transition-colors hover:bg-primary/[0.05] hover:text-primary sm:gap-1.5 sm:px-2 sm:text-xs"
        >
          <span className="whitespace-nowrap">{t("nameTagBanner.cta")}</span>
          <ArrowRight
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </div>
  );
};

export default NameTagBanner;
