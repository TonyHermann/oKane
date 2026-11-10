import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { PATHS } from "../routes/paths";
import { useTranslation } from "../i18n";
import "./SidebarLayout.css";

interface SidebarLayoutProps {
  label: string;
  children: ReactNode;
}

export const SidebarLayout = ({ label, children }: SidebarLayoutProps) => {
  const { t } = useTranslation();

  return (
    <div className="sidebar-layout">
      <aside className="sidebar-layout-aside">
        <p className="sidebar-layout-label">{label}</p>
        <nav>{children}</nav>
        <hr />
        <Link to={PATHS.HOME}>{t("settings.backHome")}</Link>
      </aside>

      <div className="sidebar-layout-content">
        <Outlet />
      </div>
    </div>
  );
};
