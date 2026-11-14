export const APP_ERROR_CODES = [
  "DATA_LOAD_FAILED",
  "DATA_SAVE_FAILED",
  "DATA_UPDATE_FAILED",
  "DATA_DELETE_FAILED",
  "TRANSACTIONS_IMPORT_FAILED",
  "RULES_APPLY_FAILED",
  "VALIDATION_FAILED",
  "IMPORT_EMPTY_FILE",
  "IMPORT_PARSE_FAILED",
  "IMPORT_FILE_READ_FAILED",
  "IMPORT_INVALID_SCHEMA",
  "IMPORT_MISSING_COLUMN",
  "IMPORT_INVALID_MAPPING",
  "UNKNOWN",
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export interface AppErrorDescriptor {
  code: AppErrorCode;
  params?: Record<string, string | number>;
}

export const isAppErrorCode = (value: unknown): value is AppErrorCode =>
  typeof value === "string" &&
  (APP_ERROR_CODES as readonly string[]).includes(value);
