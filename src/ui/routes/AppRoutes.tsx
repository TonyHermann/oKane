import { lazy, Suspense } from "react";
import { Route, BrowserRouter, Navigate } from "react-router-dom";
import { PATHS } from "./paths";

// Layouts
import { RootLayout } from "../layouts/RootLayout";

// Components
import { PageWrapper } from "../components/PageWrapper/PageWrapper";
import { Spinner } from "../components/Spinner";
import { RoutesWithNotFound } from "../components/RoutesWithNotFound/RoutesWithNotFound";

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

const SettingsLayout = lazy(() =>
  import("../pages/settings/SettingsLayout").then((m) => ({
    default: m.SettingsLayout,
  })),
);

const SettingsPage = lazy(() =>
  import("../pages/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);

const AsciiPage = lazy(() =>
  import("../pages/settings/AsciiPage").then((m) => ({
    default: m.AsciiPage,
  })),
);

const BudgetPage = lazy(() =>
  import("../pages/budget/BudgetPage").then((m) => ({ default: m.BudgetPage })),
);

const MovementsPage = lazy(() =>
  import("../pages/admin/movements/MovementsPage").then((m) => ({
    default: m.MovementsPage,
  })),
);

const CategorizationRulesPage = lazy(() =>
  import("../pages/admin/rules/CategorizationRulesPage").then((m) => ({
    default: m.CategorizationRulesPage,
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
              <Route
                path="rules"
                element={
                  <PageWrapper>
                    <CategorizationRulesPage />
                  </PageWrapper>
                }
              />
            </Route>

            <Route
              path={PATHS.SETTINGS}
              element={
                <PageWrapper>
                  <SettingsLayout />
                </PageWrapper>
              }
            >
              <Route
                index
                element={<Navigate to={PATHS.SETTINGS_GENERAL} replace />}
              />
              <Route
                path="general"
                element={
                  <PageWrapper>
                    <SettingsPage />
                  </PageWrapper>
                }
              />
              <Route
                path="ascii"
                element={
                  <PageWrapper>
                    <AsciiPage />
                  </PageWrapper>
                }
              />
            </Route>
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
