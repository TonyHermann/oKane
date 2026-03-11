import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/index.tsx";
import App from "./App.tsx";
import "./styles/index.css";
import { GlobalProvider } from "./context/global.provider.tsx";
import { ModalProvider } from "./components/modal/context/modalContext.tsx";

export const AppContainer = () => (
  <GlobalProvider>
    <ModalProvider>
      <App>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </App>
    </ModalProvider>
  </GlobalProvider>
);
