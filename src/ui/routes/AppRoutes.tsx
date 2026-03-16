import { Routes, Route } from "react-router-dom";
import type { FunctionComponent } from "react";
import { PATHS } from "./paths";

// Layouts
import { RootLayout } from "../layouts/RootLayout";

// Pages
import { HomePage } from "../pages/home/HomePage";
import { AdminLayout } from "../pages/admin/AdminLayout";
import { CategoriesPage } from "../pages/admin/categories/CategoriesPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { BudgetPage } from "../pages/budget/BudgetPage";
import { ErrorBoundary, ErrorFallback } from "@/ui/components/ErrorBoundary";

// Placeholder pages (por crear)
const MovementsPage = () => (
  <div className="window" style={{ padding: "20px" }}>
    <div className="title-bar">
      <div className="title-bar-text">Movimientos</div>
    </div>
    <div className="window-body">
      <p>Movements Page - en construcción 🚧</p>
    </div>
  </div>
);

const AccountsPage = () => (
  <div className="window" style={{ padding: "20px" }}>
    <div className="title-bar">
      <div className="title-bar-text">Cuentas</div>
    </div>
    <div className="window-body">
      <p>Accounts Page - en construcción 🚧</p>
    </div>
  </div>
);

export const AppRoutes = () => {
  const withErrorBoundary = (Component: FunctionComponent) => (
    <ErrorBoundary Fallback={ErrorFallback}>
      <Component />
    </ErrorBoundary>
  );

  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path={PATHS.HOME} element={withErrorBoundary(HomePage)} />

        <Route path={PATHS.ADMIN} element={withErrorBoundary(AdminLayout)}>
          <Route
            path="categories"
            element={withErrorBoundary(CategoriesPage)}
          />
          <Route path="movements" element={withErrorBoundary(MovementsPage)} />
          <Route path="accounts" element={withErrorBoundary(AccountsPage)} />
        </Route>

        <Route
          path={PATHS.SETTINGS}
          element={withErrorBoundary(SettingsPage)}
        />
        <Route path={PATHS.BUDGET} element={withErrorBoundary(BudgetPage)} />
      </Route>
    </Routes>
  );
};
