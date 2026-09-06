"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import ContactUsForm from "@/components/ContactUsForm";
import { cn } from "@/lib/utils";

export type ContactTopic = "mooncake" | "family-photo" | "event";

type OpenContactDetail = {
  topic?: ContactTopic;
};

const CONTACT_PRESETS: Record<
  ContactTopic,
  { title: string; description: string; source: string; message: string }
> = {
  mooncake: {
    title: "報名花膠月餅工作坊",
    description: "須預先報名，唔設即場體驗。填表後我哋會回覆確認名額同時段。",
    source: "[活動報名] 花膠月餅工作坊｜毛孩沉浸台式中秋節",
    message:
      "你好，我想報名 9 月 25–27 日觀塘海濱「毛孩沉浸台式中秋節」養生花膠月餅工作坊。請回覆確認名額同時段。",
  },
  "family-photo": {
    title: "立即登記・免費送全家福",
    description: "免費入場，帶毛孩即場參加就得。登記可獲一張全家福 soft copy。",
    source: "[活動登記] 全家福 soft copy｜毛孩沉浸式台灣中秋祭",
    message:
      "你好，我想登記 9 月 25–27 日觀塘海濱「毛孩沉浸式台灣中秋祭」，領取全家福 soft copy。",
  },
  event: {
    title: "活動查詢",
    description: "入場免費，無需預約。有工作坊、服裝租借或其他問題都可以留低聯絡方法。",
    source: "[活動查詢] 毛孩沉浸台式中秋節 2026",
    message: "",
  },
};

export function openPetwellContact(topic: ContactTopic = "event") {
  window.dispatchEvent(new CustomEvent<OpenContactDetail>("petwell:open-contact", { detail: { topic } }));
}

const PLACE_DETAIL_PATH =
  /^\/(restaurants|clinics|salons|lodging|malls|home-visits)\/[^/]+\/?$/;

function isPlaceDetailPath(pathname: string): boolean {
  return PLACE_DETAIL_PATH.test(pathname);
}

const FESTIVAL_RSVP_PATH = "/mid-autumn-taiwan-festival";

const ContactUsWidget = () => {
  const { t } = useTranslation();
  const pathname = usePathname() || "/";
  const isMidAutumnPage = pathname.includes("mid-autumn");
  const hideOnPlaceDetail = isPlaceDetailPath(pathname);
  const hideOnFestivalRsvp = pathname.startsWith(FESTIVAL_RSVP_PATH);
  const [isOpen, setIsOpen] = useState(false);
  const [contactTopic, setContactTopic] = useState<ContactTopic | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const preset = isMidAutumnPage
    ? CONTACT_PRESETS[contactTopic ?? "event"]
    : null;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const openFromPage = (event: Event) => {
      if (hideOnPlaceDetail || hideOnFestivalRsvp) return;
      const topic = (event as CustomEvent<OpenContactDetail>).detail?.topic;
      setContactTopic(topic ?? (isMidAutumnPage ? "event" : null));
      setIsOpen(true);
    };
    window.addEventListener("petwell:open-contact", openFromPage);
    return () => window.removeEventListener("petwell:open-contact", openFromPage);
  }, [hideOnPlaceDetail, hideOnFestivalRsvp, isMidAutumnPage]);

  useEffect(() => {
    if (hideOnPlaceDetail || hideOnFestivalRsvp) {
      setIsOpen(false);
    }
  }, [hideOnPlaceDetail, hideOnFestivalRsvp]);

  if (hideOnPlaceDetail || hideOnFestivalRsvp) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/20 sm:bg-transparent"
          aria-hidden="true"
        />
      )}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex flex-col items-end sm:bottom-6 sm:right-6">
        <div
          ref={panelRef}
          id="contact-us-panel"
          role="dialog"
          aria-labelledby="contact-us-title"
          aria-modal="true"
          className={cn(
            "mb-3 w-[calc(100vw-2rem)] max-w-[400px] origin-bottom-right rounded-2xl border border-border bg-background shadow-2xl transition-all duration-200 sm:w-[400px]",
            isOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-2 scale-95 opacity-0",
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0 pr-2">
              <h2 id="contact-us-title" className="text-base font-semibold leading-tight">
                {preset?.title ?? t("about.contact.title")}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {preset?.description ?? t("about.contact.description")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={t("contactWidget.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[min(70vh,560px)] overflow-y-auto px-4 py-4">
            <ContactUsForm
              key={`${isMidAutumnPage ? (contactTopic ?? "event") : "site"}`}
              sourceLabel={
                preset?.source ??
                (isMidAutumnPage
                  ? "[活動查詢] 毛孩沉浸台式中秋節 2026"
                  : "[Site Contact Widget]")
              }
              defaultMessage={preset?.message}
              compact
              onSuccess={() => setIsOpen(false)}
            />
          </div>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={() =>
            setIsOpen((open) => {
              if (!open) {
                setContactTopic(isMidAutumnPage ? "event" : null);
              }
              return !open;
            })
          }
          aria-expanded={isOpen}
          aria-controls="contact-us-panel"
          className={cn(
            "pointer-events-auto group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isOpen && "bg-primary/90",
          )}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
          <span className="max-[380px]:sr-only">
            {isMidAutumnPage ? "活動查詢" : t("contactWidget.label")}
          </span>
        </button>
      </div>
    </>
  );
};

export default ContactUsWidget;
