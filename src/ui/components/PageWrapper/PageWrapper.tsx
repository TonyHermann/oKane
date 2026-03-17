import { Suspense, type ReactNode } from "react";
import { ErrorBoundary, ErrorFallback } from "../ErrorBoundary";
import { Spinner } from "../Spinner";

interface PageWrapperProps {
  children: ReactNode;
}

export const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <ErrorBoundary Fallback={ErrorFallback}>
      <Suspense fallback={<Spinner />}>{children}</Suspense>
    </ErrorBoundary>
  );
};
