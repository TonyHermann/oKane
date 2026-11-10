import { Link } from "react-router-dom";
import { PATHS } from "../routes/paths";
import {
  HomeIcon,
  MoneyIcon,
  RefreshIcon,
  SettingsIcon,
  SlidersIcon,
} from "./NavbarIcons";

export const Navbar = () => {
  // TODO: [theming] Replace the theme controls with a persisted, accessible theme system owned by /settings; the navbar only reflects the active theme.
  return (
    <nav>
      <div className="nav_left">
        <p>【おかね】</p>
      </div>
      <div className="nav_right">
        <div className="changeThemeButton">
          <p className="changeThemeLabel">
            <RefreshIcon /> Cambiar tema
          </p>
          <div className="themeColor gray" />
          <div className="themeColor orange" />
          <div className="themeColor lightblue" />
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.HOME}>
            <HomeIcon />
            スタートページ
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.ADMIN_CATEGORIES}>
            <SlidersIcon />
            Administrar
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.BUDGET}>
            <MoneyIcon />
            Presupuesto
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link
            to={PATHS.SETTINGS}
            className="iconOnly"
            aria-label="Configuración"
            title="Configuración"
          >
            <SettingsIcon />
          </Link>
        </div>
      </div>
    </nav>
  );
};
