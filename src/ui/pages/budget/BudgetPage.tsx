import { useTranslation } from "@/ui/i18n";

export const BudgetPage = () => {
  const { t } = useTranslation();

  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">{t("budget.title")}</div>
      </div>
      <div className="window-body">
        <p>{t("budget.placeholder")}</p>
      </div>
    </div>
  );
};
