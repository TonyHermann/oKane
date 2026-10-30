import type { CsvSchema } from "../entities/Import/CsvSchema";
import { MissingRequiredColumnError } from "../errors/ImportErrors";
import type { ICsvSchemaValidator } from "./ICsvSchemaValidator";

export class CsvSchemaValidator implements ICsvSchemaValidator {
  validate(headers: string[], schema: CsvSchema) {
    const ok = schema.hasRequiredColumns(headers);

    if (!ok) {
      throw new MissingRequiredColumnError();
    }
  }
}
