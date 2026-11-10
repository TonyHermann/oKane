import { useMemo } from "react";
import { useTranslation } from "./useTranslation";

export interface Formatters {
  currency: Intl.NumberFormat;
  date: Intl.DateTimeFormat;
  number: Intl.NumberFormat;
}

export const useFormatters = (): Formatters => {
  const { locale } = useTranslation();

  return useMemo(
    () => ({
      currency: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
      }),
      date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
      number: new Intl.NumberFormat(locale),
    }),
    [locale],
  );
};
