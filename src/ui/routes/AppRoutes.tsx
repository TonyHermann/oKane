import { lazy, Suspense } from "react";
import { Route, BrowserRouter } from "react-router-dom";
import { PATHS } from "./paths";

// Layouts
import { RootLayout } from "../layouts/RootLayout";

// Components
import { PageWrapper } from "../components/PageWrapper/PageWrapper";
import { Spinner } from "../components/Spinner";
import { RoutesWithNotFound } from "../components/RoutesWithNotFound/RoutesWithNotFound";

// Lazy-loaded Pages
const HomePage = lazy(() =>
  import("../pages/home/HomePage").then((m) => ({ default: m.HomePage })),
);
const AdminLayout = lazy(() =>
  import("../pages/admin/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  })),
);
const CategoriesPage = lazy(() =>
  import("../pages/admin/categories/CategoriesPage").then((m) => ({
    default: m.CategoriesPage,
  })),
);
const SettingsPage = lazy(() =>
  import("../pages/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const BudgetPage = lazy(() =>
  import("../pages/budget/BudgetPage").then((m) => ({ default: m.BudgetPage })),
);
const MovementsPage = lazy(() =>
  import("../pages/movements/MovementsPage").then((m) => ({
    default: m.MovementsPage,
  })),
);

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <RoutesWithNotFound>
          <Route element={<RootLayout />}>
            <Route
              path={PATHS.HOME}
              element={
                <PageWrapper>
                  <HomePage />
                </PageWrapper>
              }
            />

            <Route
              path={PATHS.ADMIN}
              element={
                <PageWrapper>
                  <AdminLayout />
                </PageWrapper>
              }
            >
              <Route
                path="categories"
                element={
                  <PageWrapper>
                    <CategoriesPage />
                  </PageWrapper>
                }
              />
              <Route
                path="movements"
                element={
                  <PageWrapper>
                    <MovementsPage />
                  </PageWrapper>
                }
              />
            </Route>

            <Route
              path={PATHS.SETTINGS}
              element={
                <PageWrapper>
                  <SettingsPage />
                </PageWrapper>
              }
            />
            <Route
              path={PATHS.BUDGET}
              element={
                <PageWrapper>
                  <BudgetPage />
                </PageWrapper>
              }
            />
          </Route>
        </RoutesWithNotFound>
      </Suspense>
    </BrowserRouter>
  );
};
