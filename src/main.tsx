import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppContainer } from "./ui/AppContainer.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppContainer />
  </StrictMode>,
);
