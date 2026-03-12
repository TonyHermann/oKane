import type { ReactNode } from "react";
import "./styles/index.css";

interface AppProps {
  children: ReactNode;
}

const App = ({ children }: AppProps) => {
  return <>{children}</>;
};

export default App;
