import { Provider } from "react-redux";
import App from "./App.tsx";
import { ModalProvider } from "./components/modal/context/modalContext.tsx";
import { GlobalProvider } from "./context/global.provider.tsx";
import { AppRoutes } from "@/ui/routes/";
import {
  ErrorBoundary,
  AppErrorFallback,
} from "@/ui/components/ErrorBoundary/";
import Modal from "./components/modal/Modal.tsx";
import { store } from "./store/store.ts";

export const AppContainer = () => (
  <ErrorBoundary Fallback={AppErrorFallback}>
    <Provider store={store}>
      <GlobalProvider>
        <ModalProvider>
          <App>
            <AppRoutes />
            <Modal />
          </App>
        </ModalProvider>
      </GlobalProvider>
    </Provider>
  </ErrorBoundary>
);
