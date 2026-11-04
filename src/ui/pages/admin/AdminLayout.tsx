import { Link } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { SidebarLayout } from "../../layouts/SidebarLayout";

export const AdminLayout = () => {
  return (
    <SidebarLayout label="Admin">
      <Link to={PATHS.ADMIN_CATEGORIES}>Categorías</Link>
      <Link to={PATHS.ADMIN_MOVEMENTS}>Movimientos</Link>
      <Link to={PATHS.ADMIN_RULES}>Rules</Link>
    </SidebarLayout>
  );
};
