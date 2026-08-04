import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
const promoArt = "/assets/nametag/paws-port-promo.png";

const STORAGE_KEY = "petwell:nametagDailyPopup:lastShown:v1";
const SHOW_DELAY_MS = 900;

/** Routes where the offer page is already the destination â€” popup adds friction only. */
const SUPPRESSED_PREFIXES = [
  "/nametag",
  "/namtag",
  "/fang-zou-shi-gou-pai",
  "/anti-lost-dog-tag-hk",
  "/é˜²èµ°å¤±ç‹—ç‰Œ",
  "/activate/",
  "/pet/",
  "/check/",
] as const;

function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function readShownToday(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === localDateKey();
  } catch {
    return true;
  }
}

function markShownToday(): void {
  try {
    localStorage.setItem(STORAGE_KEY, localDateKey());
  } catch {
    // ignore quota / private mode
  }
}

function isSuppressedPath(pathname: string): boolean {
  return SUPPRESSED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix),
  );
}

const NametagDailyPopup = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isSuppressedPath(pathname) || readShownToday()) {
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      markShownToday();
      setOpen(true);
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      markShownToday();
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="nametag-daily-popup border-0 bg-transparent p-0 gap-0 overflow-visible shadow-none sm:rounded-[1.25rem] sm:max-w-[22.5rem]"
        aria-describedby="nametag-daily-popup-desc"
      >
        <div className="nametag-daily-popup__shell">
          <div className="nametag-daily-popup__art">
            <img
              src={promoArt}
              alt={t("nametagDailyPopup.imageAlt")}
              className="nametag-daily-popup__img"
              width={1080}
              height={1350}
              decoding="async"
            />
          </div>

          <div className="nametag-daily-popup__body">
            <p className="nametag-daily-popup__eyebrow">{t("nametagDailyPopup.eyebrow")}</p>

            <DialogTitle className="nametag-daily-popup__title">
              {t("nametagDailyPopup.title")}
            </DialogTitle>

            <DialogDescription id="nametag-daily-popup-desc" className="sr-only">
              {t("nametagDailyPopup.tagline")} {t("nametagDailyPopup.time")}{" "}
              {t("nametagDailyPopup.urgency")}
            </DialogDescription>

            <p className="nametag-daily-popup__tagline">{t("nametagDailyPopup.tagline")}</p>
            <p className="nametag-daily-popup__time">{t("nametagDailyPopup.time")}</p>
            <p className="nametag-daily-popup__urgency">{t("nametagDailyPopup.urgency")}</p>

            <Link
              to="/anti-lost-dog-tag-hk"
              className="nametag-daily-popup__cta"
              onClick={() => handleOpenChange(false)}
            >
              {t("nametagDailyPopup.cta")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NametagDailyPopup;
