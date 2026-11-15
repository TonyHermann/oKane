import type { AppErrorCode } from "./AppErrorCode";
import {
  CsvParseError,
  EmptyFileError,
  FileReadError,
  InvalidCsvSchemaError,
  InvalidMappingError,
  MissingRequiredColumnError,
} from "./ImportErrors";

export type ImportErrorCode = Extract<AppErrorCode, `IMPORT_${string}`>;

export interface ImportErrorDescriptor {
  code: ImportErrorCode;
  params?: Record<string, string | number>;
}

// Keeps the diagnostic that a raw Error would lose: the importer renders the
// catalog message for this descriptor instead of a generic failure string.
export const toImportErrorDescriptor = (
  error: unknown,
): ImportErrorDescriptor => {
  if (error instanceof MissingRequiredColumnError) {
    const column = typeof error.details === "string" ? error.details : undefined;

    return column
      ? { code: "IMPORT_MISSING_COLUMN", params: { column } }
      : { code: "IMPORT_MISSING_COLUMN" };
  }

  if (error instanceof InvalidCsvSchemaError) {
    return { code: "IMPORT_INVALID_SCHEMA" };
  }

  if (error instanceof InvalidMappingError) {
    return { code: "IMPORT_INVALID_MAPPING" };
  }

  if (error instanceof FileReadError) {
    return { code: "IMPORT_FILE_READ_FAILED" };
  }

  if (error instanceof EmptyFileError) {
    return { code: "IMPORT_EMPTY_FILE" };
  }

  if (error instanceof CsvParseError) {
    return { code: "IMPORT_PARSE_FAILED" };
  }

  return { code: "IMPORT_PARSE_FAILED" };
};
