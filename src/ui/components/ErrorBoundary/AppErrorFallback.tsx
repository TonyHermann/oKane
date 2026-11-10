import { I18nProvider, useTranslation } from "@/ui/i18n";

const AppErrorContent = () => {
  const { t } = useTranslation();
  const handleClick = () => {
    window.location.href = "/";
  };
  return (
    <div className="errorPage">
      <h2>{t("errors.boundary.title")}</h2>
      <p>
        {t("errors.boundary.try")}{" "}
        <button onClick={handleClick} type="button">
          {t("errors.boundary.retry")}
        </button>
      </p>
    </div>
  );
};

// The root ErrorBoundary sits outside the app-level I18nProvider, so the
// fallback owns a provider to keep its copy translated even after a crash.
export const AppErrorFallback = () => (
  <I18nProvider>
    <AppErrorContent />
  </I18nProvider>
);
