import { NotFoundPage } from "@/ui/pages/404/NotFoundPage";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { PageWrapper } from "../PageWrapper/PageWrapper";

interface RoutesWithNotFoundProps {
  children: ReactNode;
}

export const RoutesWithNotFound = ({ children }: RoutesWithNotFoundProps) => {
  return (
    <Routes>
      {children}
      <Route
        path="*"
        element={
          <PageWrapper>
            <NotFoundPage />
          </PageWrapper>
        }
      />
    </Routes>
  );
};
