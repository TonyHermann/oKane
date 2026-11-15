import { Link } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { SidebarLayout } from "../../layouts/SidebarLayout";
import { useTranslation } from "@/ui/i18n";

export const AdminLayout = () => {
  const { t } = useTranslation();

  return (
    <SidebarLayout label={t("admin.label")}>
      <Link to={PATHS.ADMIN_CATEGORIES}>{t("admin.nav.categories")}</Link>
      <Link to={PATHS.ADMIN_MOVEMENTS}>{t("admin.nav.movements")}</Link>
      <Link to={PATHS.ADMIN_RULES}>{t("admin.nav.rules")}</Link>
    </SidebarLayout>
  );
};
