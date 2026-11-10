import type { ReactNode } from "react";
// TODO: [css-ownership-migration] Move component and page styles beside their owners while keeping only intentional base/theme rules global.
import "./styles/index.css";
import { I18nProvider } from "./i18n";

interface AppProps {
  children: ReactNode;
}

const App = ({ children }: AppProps) => {
  // TODO: [notifications] Add a themeable Clippy-style toast host and define a typed notification boundary instead of coupling the logger directly to UI state.
  // TODO: [community-plugins] Define and implement a safe extension model for community plugins, including discovery, permissions, lifecycle, and failure isolation.
  return <I18nProvider>{children}</I18nProvider>;
};

export default App;
