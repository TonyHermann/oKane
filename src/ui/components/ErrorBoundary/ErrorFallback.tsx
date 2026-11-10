import { useTranslation } from "@/ui/i18n";
import type { FallbackProps } from "./ErrorBoundaryTypes";

export const ErrorFallback = ({ error, resetError }: FallbackProps) => {
  const { t } = useTranslation();
  const { message } = error;
  return (
    <div className="errorPage">
      <h2>{t("errors.boundary.title")}</h2>
      <p>
        {t("errors.boundary.try")}{" "}
        <button onClick={resetError} type="button">
          {t("errors.boundary.retry")}
        </button>
      </p>
      <p>{message}</p>
    </div>
  );
};
