import { en } from "./en";
import { es, type MessageKey } from "./es";

export { en, es };
export type { MessageKey };

export const SUPPORTED_LOCALES = ["es", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export const catalogs: Record<
  Locale,
  Partial<Record<MessageKey, string>>
> = {
  es,
  en,
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" &&
  (SUPPORTED_LOCALES as readonly string[]).includes(value);
