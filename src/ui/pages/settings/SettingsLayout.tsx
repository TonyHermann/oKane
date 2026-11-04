import { Link } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { SidebarLayout } from "../../layouts/SidebarLayout";

export const SettingsLayout = () => {
  return (
    <SidebarLayout label="Configuración">
      <Link to={PATHS.SETTINGS_GENERAL}>General</Link>
      <Link to={PATHS.SETTINGS_ASCII}>Panel ASCII</Link>
    </SidebarLayout>
  );
};
