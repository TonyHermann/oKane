import type { CsvSchema } from "../entities/Import/CsvSchema";
import { MissingRequiredColumnError } from "../errors/ImportErrors";
import type { ICsvSchemaValidator } from "./ICsvSchemaValidator";

export const csvSchemaValidator: ICsvSchemaValidator = {
  validate(headers: string[], schema: CsvSchema) {
    const missingColumn = schema.requiredColumns.find(
      (column) => !headers.includes(column),
    );

    if (missingColumn) {
      throw new MissingRequiredColumnError(missingColumn);
    }
  },
};
