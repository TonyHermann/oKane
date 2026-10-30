import { DomainError } from "./DomainErrors";

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
  constructor(message: string = "Invalid mapping", details?: any) {
    super(message, "INVALID_MAPPING", details);
    this.name = "InvalidMappingError";
  }
}
