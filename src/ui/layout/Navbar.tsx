import { Link } from "react-router-dom";
import { PATHS } from "../routes/paths";

export const Navbar = () => {
  // TODO: [theming] Replace the theme controls with a persisted, accessible theme system and a single source of truth for tokens.
  return (
    <nav>
      <div className="nav_left">
        <p>【おかね】</p>
      </div>
      <div className="nav_right">
        <div className="changeThemeButton">
          <p>
            <i className="fa fa-refresh" aria-hidden="true" /> Cambiar tema
          </p>
          <div className="themeColor gray" />
          <div className="themeColor orange" />
          <div className="themeColor lightblue" />
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.HOME}>
            <i className="fa fa-home" aria-hidden="true" />
            スタートページ
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.ADMIN_CATEGORIES}>
            <i className="fa fa-home" aria-hidden="true" />
            Administrar
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.SETTINGS}>
            <i className="fa fa-cog" aria-hidden="true" />
            Configuración
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.BUDGET}>
            <i className="fa fa-usd" aria-hidden="true" />
            Presupuesto
          </Link>
        </div>
      </div>
    </nav>
  );
};
