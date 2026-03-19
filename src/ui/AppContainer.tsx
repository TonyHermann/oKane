import App from "./App.tsx";
import { ModalProvider } from "./components/modal/context/modalContext.tsx";
import { GlobalProvider } from "./context/global.provider.tsx";
import { AppRoutes } from "@/ui/routes/";
import "./styles/index.css";
import {
  ErrorBoundary,
  AppErrorFallback,
} from "@/ui/components/ErrorBoundary/";

export const AppContainer = () => (
  <ErrorBoundary Fallback={AppErrorFallback}>
    <GlobalProvider>
      <ModalProvider>
        <App>
          <AppRoutes />
        </App>
      </ModalProvider>
    </GlobalProvider>
  </ErrorBoundary>
);
