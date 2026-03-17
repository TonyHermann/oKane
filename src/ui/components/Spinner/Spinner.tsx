import type { FunctionComponent } from "react";

export interface SpinnerProps {
  /**
   * Size of the spinner in pixels.
   * @default 24
   */
  size?: number;
  /**
   * Accessible label for the spinner.
   * @default "Loading"
   */
  label?: string;
  /**
   * Additional CSS classes to apply.
   */
  className?: string;
}

export const Spinner: FunctionComponent<SpinnerProps> = ({
  size = 24,
  label = "Loading",
  className = "",
}) => {
  return (
    <div
      className={`spinner ${className}`.trim()}
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
    >
      <span className="spinner-icon" />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;
