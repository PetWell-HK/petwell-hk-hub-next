import en from "@/i18n/locales/en.json";
import zh from "@/i18n/locales/zh.json";
import { DEFAULT_LOCALE, type AppLocale } from "@/lib/locale";

const dictionaries = {
  zh,
  en,
} as const;

export type Dictionary = (typeof dictionaries)[AppLocale];

export function getDictionary(locale: AppLocale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function translate(
  dict: Dictionary,
  path: string,
  fallback = "",
): string {
  const parts = path.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return fallback;
    }
  }
  return typeof current === "string" ? current : fallback;
}
