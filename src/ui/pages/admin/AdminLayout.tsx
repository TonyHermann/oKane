import { Link, Outlet } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import "./AdminLayout.css";

export const AdminLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "90vh" }}>
      <aside className="admin-layout-aside">
        <h3>Admin</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link to={PATHS.ADMIN_CATEGORIES}>Categorías</Link>
          <Link to={PATHS.ADMIN_MOVEMENTS}>Movimientos</Link>
          <Link to={PATHS.ADMIN_RULES}>Rules</Link>
        </nav>
        <hr />
        <Link to={PATHS.HOME}>← Volver al inicio</Link>
      </aside>

      <main style={{ flex: 1, padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
};
