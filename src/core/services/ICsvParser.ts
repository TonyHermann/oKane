export type ICsvRow = Record<string, string>;
export type CsvParseResult = { headers: string[]; rows: ICsvRow[] };

export interface ICsvParser {
  parse(content: string): Promise<CsvParseResult>;
}
