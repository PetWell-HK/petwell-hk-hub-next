import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LOCALE_COOKIE } from '@/lib/locale';
import zh from './locales/zh.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    fallbackLng: 'zh',
    detection: {
      order: ['cookie', 'localStorage'],
      caches: ['cookie', 'localStorage'],
      lookupCookie: LOCALE_COOKIE,
      cookieMinutes: 60 * 24 * 365,
      cookieOptions: { path: '/', sameSite: 'lax' },
    },
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
