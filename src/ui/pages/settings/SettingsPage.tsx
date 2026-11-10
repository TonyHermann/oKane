import { useTranslation } from "../../i18n";

export const SettingsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">{t("settings.general")}</div>
      </div>
      <div className="window-body">
        <h3>{t("settings.general")}</h3>
        <p>{t("settings.general.placeholder")}</p>
      </div>
    </div>
  );
};
