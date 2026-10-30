export class CsvSchema {
  constructor(public readonly requiredColumns: string[]) {}

  hasRequiredColumns(columns: string[]): boolean {
    return this.requiredColumns.every((col) => columns.includes(col));
  }
}
