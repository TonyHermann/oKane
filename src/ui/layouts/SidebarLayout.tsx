import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { PATHS } from "../routes/paths";
import { useTranslation } from "../i18n";
import styles from "./SidebarLayout.module.css";

interface SidebarLayoutProps {
  label: string;
  children: ReactNode;
}

export const SidebarLayout = ({ label, children }: SidebarLayoutProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.sidebarLayout}>
      <aside className={styles.aside}>
        <p className={styles.label}>{label}</p>
        <nav className={styles.nav}>{children}</nav>
        <hr />
        <Link to={PATHS.HOME}>{t("settings.backHome")}</Link>
      </aside>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};
