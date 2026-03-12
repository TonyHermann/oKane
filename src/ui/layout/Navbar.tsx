import { Link } from "react-router-dom";
import { PATHS } from "../routes/paths";

export const Navbar = () => {
  return (
    <nav>
      <div className="nav_left">
        <p>【おかね】</p>
      </div>
      <div className="nav_right">
        <div className="changeThemeButton">
          <p>
            <i className="fa fa-refresh" aria-hidden="true"></i> Cambiar tema
          </p>
          <div className="themeColor gray"></div>
          <div className="themeColor orange"></div>
          <div className="themeColor lightblue"></div>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.HOME}>
            <i className="fa fa-home" aria-hidden="true"></i>スタートページ
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.ADMIN_CATEGORIES}>
            <i className="fa fa-home" aria-hidden="true"></i>Administrar
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.SETTINGS}>
            <i className="fa fa-cog" aria-hidden="true"></i>Configuración
          </Link>
        </div>
        <div className="buttonWithIcon">
          <Link to={PATHS.BUDGET}>
            <i className="fa fa-usd" aria-hidden="true"></i>Presupuesto
          </Link>
        </div>
      </div>
    </nav>
  );
};
