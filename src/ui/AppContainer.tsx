import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/index.tsx";
import App from "./App.tsx";
import "./styles/index.css";
import { GlobalProvider } from "./context/global.provider.tsx";
import { ModalProvider } from "./components/modal/context/modalContext.tsx";
import ErrorBoundary from "./ErrorBoundary.tsx";

export const AppContainer = () => (
  <ErrorBoundary fallback={<p>¡Oh! Lo sentimos, ha ocurrido un error.</p>}>
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
