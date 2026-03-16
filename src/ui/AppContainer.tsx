import { BrowserRouter } from "react-router-dom";
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
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </App>
      </ModalProvider>
    </GlobalProvider>
  </ErrorBoundary>
);
