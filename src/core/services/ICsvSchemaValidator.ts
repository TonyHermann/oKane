import type { CsvSchema } from "../entities/Import/CsvSchema";

export interface ICsvSchemaValidator {
  validate(headers: string[], schema: CsvSchema): void;
}
