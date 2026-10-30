import type { ReactNode } from "react";
import "./panel.css";

interface PanelProps {
  children: ReactNode;
}

export const Panel = ({ children }: PanelProps) => {
  return <div className="panel">{children}</div>;
};
