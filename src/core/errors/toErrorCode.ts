import { ValidationError } from "./DomainErrors";
import {
  InvalidCsvSchemaError,
  InvalidMappingError,
  MissingRequiredColumnError,
} from "./ImportErrors";
import { isAppErrorCode, type AppErrorCode } from "./AppErrorCode";

export const toErrorCode = (error: unknown): AppErrorCode => {
  if (error instanceof ValidationError) {
    return "VALIDATION_FAILED";
  }

  if (
    error instanceof InvalidCsvSchemaError ||
    error instanceof InvalidMappingError ||
    error instanceof MissingRequiredColumnError
  ) {
    return "TRANSACTIONS_IMPORT_FAILED";
  }

  return "UNKNOWN";
};

export const resolveErrorCode = (
  payload: unknown,
  fallback: AppErrorCode,
): AppErrorCode =>
  isAppErrorCode(payload) && payload !== "UNKNOWN" ? payload : fallback;
