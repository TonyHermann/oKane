import { es, type MessageKey } from "./es";

export { es };
export type { MessageKey };

export const SUPPORTED_LOCALES = ["es"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export const catalogs: Record<
  Locale,
  Partial<Record<MessageKey, string>>
> = {
  es,
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" &&
  (SUPPORTED_LOCALES as readonly string[]).includes(value);
