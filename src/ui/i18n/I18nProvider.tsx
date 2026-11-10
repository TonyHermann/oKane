import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  catalogs,
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
  type MessageKey,
} from "./locales";

export const LOCALE_STORAGE_KEY = "okane.locale";

export type TranslationParams = Record<string, string | number>;

export interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: TranslationParams) => string;
}

export const I18nContext = createContext<I18nValue | null>(null);

const detectLocale = (): Locale => {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) {
      return stored;
    }
  } catch {
    // Storage can be unavailable; fall through to the browser language.
  }

  try {
    const primarySubtag = navigator.language.split("-")[0].toLowerCase();
    if (isLocale(primarySubtag)) {
      return primarySubtag;
    }
  } catch {
    // navigator can be unavailable; fall through to the default locale.
  }

  return DEFAULT_LOCALE;
};

const interpolate = (
  template: string,
  params?: TranslationParams,
): string => {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {
      // Ignore document access failures; the catalog still applies.
    }

    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore storage failures; the locale still applies for this session.
    }
  }, [locale]);

  const value = useMemo<I18nValue>(() => {
    const t = (key: MessageKey, params?: TranslationParams): string => {
      const template = catalogs[locale][key];

      if (template === undefined) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn(`[i18n] Missing "${key}" in the "${locale}" catalog.`);
        }

        const fallback = catalogs[DEFAULT_LOCALE][key];
        return fallback === undefined ? key : interpolate(fallback, params);
      }

      return interpolate(template, params);
    };

    return { locale, setLocale, t };
  }, [locale]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
};
