export { en } from "./locales/en";
export { es } from "./locales/es";
export type { MessageKey } from "./locales/es";
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  catalogs,
} from "./locales";
export type { Locale } from "./locales";
export {
  I18nProvider,
  I18nContext,
  LOCALE_STORAGE_KEY,
} from "./I18nProvider";
export type { I18nValue, TranslationParams } from "./I18nProvider";
export { useTranslation } from "./useTranslation";
export { useFormatters } from "./useFormatters";
export type { Formatters } from "./useFormatters";
export { usePlural } from "./usePlural";
export type { PluralKeys } from "./usePlural";
