import { Link } from "react-router-dom";
import { PATHS } from "../routes/paths";
import { HomeIcon, MoneyIcon, RefreshIcon, SettingsIcon } from "./NavbarIcons";

export const Navbar = () => {
  // TODO: [theming] Replace the theme controls with a persisted, accessible theme system and a single source of truth for tokens.
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
            <HomeIcon />
            Administrar
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.SETTINGS}>
            <SettingsIcon />
            Configuración
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.BUDGET}>
            <MoneyIcon />
            Presupuesto
          </Link>
        </div>
      </div>
    </nav>
  );
};
