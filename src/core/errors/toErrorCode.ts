import { ValidationError } from "./DomainErrors";
import {
  InvalidCsvSchemaError,
  InvalidMappingError,
  MissingRequiredColumnError,
} from "./ImportErrors";
import { isAppErrorCode, type AppErrorCode } from "./AppErrorCode";

// Maps a thrown cause to the stable code the store exposes. Validation
// failures are precise; import failures collapse into the generic import
// code because the store cannot carry the diagnostic params. The per-thunk
// fallback (see resolveErrorCode) is what gives persistence failures their
// operation-specific code.
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

// `.rejected` only trusts an explicit code. UNKNOWN means "the cause carried
// no actionable information", so the operation-specific fallback wins.
export const resolveErrorCode = (
  payload: unknown,
  fallback: AppErrorCode,
): AppErrorCode =>
  isAppErrorCode(payload) && payload !== "UNKNOWN" ? payload : fallback;
