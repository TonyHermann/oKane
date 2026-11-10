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

export const Navbar = () => {
  // TODO: [theming] Replace the theme controls with a persisted, accessible theme system owned by /settings; the navbar only reflects the active theme.
  const { t } = useTranslation();

  return (
    <nav>
      <div className="nav_left">
        <p>【おかね】</p>
      </div>
      <div className="nav_right">
        <div className="changeThemeButton">
          <p className="changeThemeLabel">
            <RefreshIcon /> {t("nav.changeTheme")}
          </p>
          <div className="themeColor gray" />
          <div className="themeColor orange" />
          <div className="themeColor lightblue" />
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.HOME}>
            <HomeIcon />
            {t("nav.home")}
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.ADMIN_CATEGORIES}>
            <SlidersIcon />
            {t("nav.admin")}
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.BUDGET}>
            <MoneyIcon />
            {t("nav.budget")}
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link
            to={PATHS.SETTINGS}
            className="iconOnly"
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
