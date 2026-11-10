import { lazy, Suspense } from "react";
import { Route, BrowserRouter, Navigate, Routes } from "react-router-dom";
import { PATHS } from "./paths";

// Layouts
import { RootLayout } from "../layouts/RootLayout";

// Components
import { PageWrapper } from "../components/PageWrapper/PageWrapper";
import { Spinner } from "../components/Spinner";
import { NotFoundPage } from "../pages/404/NotFoundPage";

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

const LanguagePage = lazy(() =>
  import("../pages/settings/LanguagePage").then((m) => ({
    default: m.LanguagePage,
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
        <Routes>
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
              <Route
                path="language"
                element={
                  <PageWrapper>
                    <LanguagePage />
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
            <Route
              path="*"
              element={
                <PageWrapper>
                  <NotFoundPage />
                </PageWrapper>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
