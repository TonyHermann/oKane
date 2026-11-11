import { useTranslation } from "@/ui/i18n";

export const MonthSummary = () => {
  const { t } = useTranslation();

  return <p>{t("charts.monthSummary")}</p>;
};
