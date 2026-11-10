import { useMemo } from "react";
import type { MessageKey } from "./locales";
import { useTranslation } from "./useTranslation";

export type PluralKeys = { one: MessageKey; other: MessageKey };

export const usePlural = () => {
  const { locale, t } = useTranslation();
  const rules = useMemo(() => new Intl.PluralRules(locale), [locale]);

  return (keys: PluralKeys, count: number): string =>
    t(keys[rules.select(count) as "one" | "other"] ?? keys.other, { count });
};
