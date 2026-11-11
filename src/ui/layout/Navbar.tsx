import { Link } from "react-router-dom";
import { PATHS } from "../routes/paths";
import { useTranslation } from "../i18n";
import {
  HomeIcon,
  MoneyIcon,
  RefreshIcon,
  SettingsIcon,
  SlidersIcon,
} from "./NavbarIcons";
import styles from "./Navbar.module.css";

export const Navbar = () => {
  // TODO: [theming] Replace the theme controls with a persisted, accessible theme system owned by /settings; the navbar only reflects the active theme.
  const { t } = useTranslation();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <p>【おかね】</p>
      </div>
      <div className={styles.navRight}>
        <div className={styles.changeThemeButton}>
          <p className={styles.changeThemeLabel}>
            <RefreshIcon /> {t("nav.changeTheme")}
          </p>
          <div className={`${styles.themeColor} ${styles.gray}`} />
          <div className={`${styles.themeColor} ${styles.orange}`} />
          <div className={`${styles.themeColor} ${styles.lightblue}`} />
        </div>
        <div className={styles.buttonWithIcon}>
          <Link to={PATHS.HOME}>
            <HomeIcon />
            {t("nav.home")}
          </Link>
        </div>
        <div className={styles.buttonWithIcon}>
          <Link to={PATHS.ADMIN_CATEGORIES}>
            <SlidersIcon />
            {t("nav.admin")}
          </Link>
        </div>
        <div className={styles.buttonWithIcon}>
          <Link to={PATHS.BUDGET}>
            <MoneyIcon />
            {t("nav.budget")}
          </Link>
        </div>
        <div className={styles.buttonWithIcon}>
          <Link
            to={PATHS.SETTINGS}
            className={styles.iconOnly}
            aria-label={t("nav.settings")}
            title={t("nav.settings")}
          >
            <SettingsIcon />
          </Link>
        </div>
      </div>
    </nav>
  );
};
