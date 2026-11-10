import type { AppErrorCode } from "@/core/errors/AppErrorCode";
import type { MessageKey } from "./locales/es";
import { useTranslation } from "./useTranslation";

const ERROR_KEYS: Record<AppErrorCode, MessageKey> = {
  DATA_LOAD_FAILED: "errors.loadFailed",
  DATA_SAVE_FAILED: "errors.saveFailed",
  DATA_UPDATE_FAILED: "errors.updateFailed",
  DATA_DELETE_FAILED: "errors.deleteFailed",
  TRANSACTIONS_IMPORT_FAILED: "errors.importFailed",
  RULES_APPLY_FAILED: "errors.applyRulesFailed",
  VALIDATION_FAILED: "errors.validationFailed",
  UNKNOWN: "errors.unknown",
};

export const useErrorMessage = () => {
  const { t } = useTranslation();

  return (code: AppErrorCode | null) => (code ? t(ERROR_KEYS[code]) : "");
};
