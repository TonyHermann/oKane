import Papa from "papaparse";
import type { CsvParseResult, ICsvParser } from "@/core/services/ICsvParser";

export const PapaCsvParser: ICsvParser = {
  async parse(content: string): Promise<CsvParseResult> {
    // TODO: [import-currency] Normalize imported monetary values and currency codes such as EUR without losing the original value.
    if (!content.trim()) {
      throw new Error("El archivo está vacio.");
    }

    return new Promise((resolve, reject) => {
      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        delimiter: "", // auto-detect
        transformHeader: (header) => header.trim().toLowerCase(),
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(
              new Error(`Error al parsear CSV: ${results.errors[0].message}`),
            );
            return;
          }

          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, string>[];

          resolve({ headers, rows });
        },
        error: (error: Error) => {
          reject(new Error(`Error al parsear CSV: ${error.message}`));
        },
      });
    });
  },
};
