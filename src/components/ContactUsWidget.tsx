import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, X } from "lucide-react";
import ContactUsForm from "@/components/ContactUsForm";
import { cn } from "@/lib/utils";

const ContactUsWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    const openFromPage = () => setIsOpen(true);
    window.addEventListener("petwell:open-contact", openFromPage);
    return () => window.removeEventListener("petwell:open-contact", openFromPage);
  }, []);

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
                {t("about.contact.title")}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("about.contact.description")}</p>
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
              sourceLabel="[Site Contact Widget]"
              compact
              onSuccess={() => setIsOpen(false)}
            />
          </div>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen((open) => !open)}
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
          <span className="max-[380px]:sr-only">{t("contactWidget.label")}</span>
        </button>
      </div>
    </>
  );
};

export default ContactUsWidget;
