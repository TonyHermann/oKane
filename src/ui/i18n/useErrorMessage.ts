import {
  type AppErrorCode,
  type AppErrorDescriptor,
} from "@/core/errors/AppErrorCode";
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
  IMPORT_EMPTY_FILE: "errors.importEmptyFile",
  IMPORT_PARSE_FAILED: "errors.importParseFailed",
  IMPORT_FILE_READ_FAILED: "errors.importFileReadFailed",
  IMPORT_INVALID_SCHEMA: "errors.importInvalidSchema",
  IMPORT_MISSING_COLUMN: "errors.importMissingColumn",
  IMPORT_INVALID_MAPPING: "errors.importInvalidMapping",
  UNKNOWN: "errors.unknown",
};

export type ErrorMessageInput = AppErrorCode | AppErrorDescriptor | null;

export const useErrorMessage = () => {
  const { t } = useTranslation();

  return (input: ErrorMessageInput) => {
    if (!input) return "";

    if (typeof input === "string") {
      return t(ERROR_KEYS[input]);
    }

    return t(ERROR_KEYS[input.code], input.params);
  };
};
