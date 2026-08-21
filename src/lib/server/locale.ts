import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  parseLocale,
  type AppLocale,
} from "@/lib/locale";

/** Request locale from the readable cookie. Defaults to zh for crawlers. */
export async function getRequestLocale(): Promise<AppLocale> {
  try {
    const store = await cookies();
    return parseLocale(store.get(LOCALE_COOKIE)?.value);
  } catch {
    return DEFAULT_LOCALE;
  }
}
