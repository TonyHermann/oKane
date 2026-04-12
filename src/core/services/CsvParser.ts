import Papa from "papaparse";

const VALID_MIME_TYPES = ["text/csv", "text/plain", "application/csv"];
const VALID_EXTENSIONS = [".csv"];

type ParseResult = {
  rows: Record<string, string>[];
  headers: string[];
};

export const CsvParser = {
  async parse(file: File): Promise<ParseResult> {
    const content = await file.text();

    this.ValidateFileType(file);

    if (!content.trim()) {
      throw new Error("El archivo está vacío.");
    }

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
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
        error: (error) => {
          reject(new Error(`Error al parsear CSV: ${error.message}`));
        },
      });
    });
  },

  ValidateFileType(file: File): void {
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    const isValidExtension = VALID_EXTENSIONS.includes(extension);
    const isValidType = VALID_MIME_TYPES.some(
      (type) => file.type.includes(type) || file.type === "",
    );

    if (!isValidExtension || !isValidType) {
      throw new Error("File type not valid");
    }
  },
};
