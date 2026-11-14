import { DomainError } from "./DomainErrors";

export class EmptyFileError extends DomainError {
  constructor() {
    super("The file is empty", "EMPTY_FILE");
    this.name = "EmptyFileError";
  }
}

export class CsvParseError extends DomainError {
  constructor(message: string = "CSV parse failed", details?: unknown) {
    super(message, "CSV_PARSE_FAILED", details);
    this.name = "CsvParseError";
  }
}

export class FileReadError extends DomainError {
  constructor(message: string = "The file could not be read") {
    super(message, "FILE_READ_FAILED");
    this.name = "FileReadError";
  }
}

export class InvalidCsvSchemaError extends DomainError {
  constructor() {
    super("Invalid CsvSchema", "INVALID_CSV_SCHEMA");
    this.name = "InvalidCsvSchemaError";
  }
}

export class MissingRequiredColumnError extends DomainError {
  constructor(columnName?: string) {
    super(
      columnName
        ? `Missing required column: ${columnName}`
        : "Missing required column",
      "MISSING_REQUIRED_COLUMN",
      columnName,
    );
    this.name = "MissingRequiredColumnError";
  }
}

export class InvalidMappingError extends DomainError {
  constructor(message: string = "Invalid mapping", details?: unknown) {
    super(message, "INVALID_MAPPING", details);
    this.name = "InvalidMappingError";
  }
}
