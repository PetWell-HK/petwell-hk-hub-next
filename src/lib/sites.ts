export const EVENTS_SITE_URL = "https://events.petwellhk.com";

export function eventsSiteUrl(language?: string): string {
  const isEnglish = (language ?? "").toLowerCase().startsWith("en");
  return isEnglish ? `${EVENTS_SITE_URL}/en` : EVENTS_SITE_URL;
}
