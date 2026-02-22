interface NavbarProps {
  onOpenCategoryManager?: () => void;
}

export const Navbar = ({ onOpenCategoryManager }: NavbarProps) => {
  return (
    <nav>
      <div className="nav_left">
        <p>【お金】</p>
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
          <a href="/">
            <i className="fa fa-home" aria-hidden="true"></i>スタートページ
          </a>
        </div>
        <div className="buttonWithIcon">
          <a href="/legacy">
            <i className="fa fa-home" aria-hidden="true"></i>Legacy
          </a>
        </div>
        <button className="buttonWithIcon" type="button" onClick={onOpenCategoryManager}>
          <i className="fa fa-home" aria-hidden="true"></i>Administrar categorías
        </button>
      </div>
    </nav>
  );
};
