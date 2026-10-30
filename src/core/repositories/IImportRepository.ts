import type { ColumnMapping } from "../entities/Import/ColumnMapping";
import type { CsvSchema } from "../entities/Import/CsvSchema";

export interface IImportRepository {
  import(content: string, schema: CsvSchema, mapping: ColumnMapping): void;
}
