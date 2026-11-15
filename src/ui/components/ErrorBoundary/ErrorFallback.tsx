import { useTranslation } from "@/ui/i18n";
import type { FallbackProps } from "./ErrorBoundaryTypes";

export const ErrorFallback = ({ resetError }: FallbackProps) => {
  const { t } = useTranslation();
  return (
    <div className="errorPage">
      <h2>{t("errors.boundary.title")}</h2>
      <p>
        {t("errors.boundary.try")}{" "}
        <button onClick={resetError} type="button">
          {t("errors.boundary.retry")}
        </button>
      </p>
      <p>{t("errors.unknown")}</p>
    </div>
  );
};
