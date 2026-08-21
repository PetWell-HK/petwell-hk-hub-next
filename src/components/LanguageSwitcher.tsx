"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { htmlLang, parseLocale, setLocaleCookie } from "@/lib/locale";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "zh", short: "繁", name: "繁體中文" },
  { code: "en", short: "EN", name: "English" },
] as const;

const LanguageSwitcher = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const current = parseLocale(i18n.language);

  return (
    <div
      role="radiogroup"
      aria-label="Language 語言"
      className="relative inline-grid h-8 grid-cols-2 items-center rounded-full border border-border bg-secondary/80 p-0.5"
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-background shadow-sm ring-1 ring-black/[0.04] transition-transform duration-200 ease-out motion-reduce:transition-none",
          current === "en" && "translate-x-full",
        )}
      />
      {LANGUAGES.map((lang) => {
        const isActive = current === lang.code;

        return (
          <button
            key={lang.code}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={lang.name}
            onClick={() => {
              if (!isActive) {
                setLocaleCookie(lang.code);
                void i18n.changeLanguage(lang.code);
                document.documentElement.lang = htmlLang(lang.code);
                router.refresh();
              }
            }}
            className={cn(
              "relative z-10 inline-flex h-full min-w-[2.35rem] items-center justify-center rounded-full px-2.5 text-xs font-semibold tracking-wide transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {lang.short}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
