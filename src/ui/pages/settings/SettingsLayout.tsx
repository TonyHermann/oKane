import { Link } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { SidebarLayout } from "../../layouts/SidebarLayout";
import { useTranslation } from "../../i18n";

export const SettingsLayout = () => {
  const { t } = useTranslation();

  return (
    <SidebarLayout label={t("settings.title")}>
      <Link to={PATHS.SETTINGS_GENERAL}>{t("settings.general")}</Link>
      <Link to={PATHS.SETTINGS_ASCII}>{t("settings.ascii")}</Link>
    </SidebarLayout>
  );
};
