import type { FunctionComponent } from "react";
import { useTranslation } from "@/ui/i18n";
import "./spinner.css";

export interface SpinnerProps {
  /**
   * Size of the spinner in pixels.
   * @default 24
   */
  size?: number;
  /**
   * Accessible label for the spinner.
   * @default the localized "Loading" message
   */
  label?: string;
  /**
   * Additional CSS classes to apply.
   */
  className?: string;
}

export const Spinner: FunctionComponent<SpinnerProps> = ({
  size = 24,
  label,
  className = "",
}) => {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("common.loading");

  return (
    <div
      className={`spinner ${className}`.trim()}
      role="status"
      aria-label={resolvedLabel}
      style={{ width: size, height: size }}
    >
      <span className="spinner-icon" />
      <span className="sr-only">{resolvedLabel}</span>
    </div>
  );
};

export default Spinner;
