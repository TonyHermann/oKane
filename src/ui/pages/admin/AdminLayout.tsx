import { Link, Outlet } from "react-router-dom";
import { PATHS } from "../../routes/paths";

export const AdminLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "90vh" }}>
      {/* Sidebar */}
      <aside style={{ width: "200px", background: "#f0f0f0", padding: "16px" }}>
        <h3>Admin</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link to={PATHS.ADMIN_CATEGORIES}>Categorías</Link>
          <Link to={PATHS.ADMIN_MOVEMENTS}>Movimientos</Link>
        </nav>
        <hr />
        <Link to={PATHS.HOME}>← Volver al inicio</Link>
      </aside>

      {/* Contenido de la página */}
      <main style={{ flex: 1, padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
};
