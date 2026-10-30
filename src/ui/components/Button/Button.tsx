import type { ReactNode } from "react";
import "./button.css";

interface ButtonProps {
  label: string;
  icon?: ReactNode;
  size: "sm" | "md" | "lg";
  variant: "primary" | "danger" | "icon";
  onClick: () => void;
}

export const Button = ({
  label,
  size,
  variant,
  onClick,
  icon,
}: ButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`buttonComponent button-${size} button-${variant}`}
    >
      {icon ?? <div className="button-icon">{icon}</div>}
      {variant === "icon" ? "" : <div className="button-content">{label}</div>}
    </button>
  );
};
