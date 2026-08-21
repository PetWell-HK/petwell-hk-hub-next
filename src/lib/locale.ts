export const APP_LOCALES = ["zh", "en"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "zh";

/** Readable by the server. Must match i18next `lookupCookie`. */
export const LOCALE_COOKIE = "petwell-locale";

const LOCALE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseLocale(value: string | null | undefined): AppLocale {
  if (!value) return DEFAULT_LOCALE;
  return value.toLowerCase().startsWith("en") ? "en" : "zh";
}

export function htmlLang(locale: AppLocale): "zh-HK" | "en" {
  return locale === "en" ? "en" : "zh-HK";
}

export function openGraphLocale(locale: AppLocale): "en_US" | "zh_HK" {
  return locale === "en" ? "en_US" : "zh_HK";
}

export function setLocaleCookie(locale: AppLocale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_MAX_AGE_SECONDS}; samesite=lax`;
}
