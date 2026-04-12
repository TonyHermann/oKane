import { describe, it, expect } from "vitest";
import { CsvParser } from "./CsvParser";

// Helpers
const createMockFile = (
  content: string,
  filename: string = "test.csv",
  type: string = "text/csv",
): File => {
  const blob = new Blob([content], { type });
  return new File([blob], filename);
};

describe("CsvParser", () => {
  it("should parse a proper csv with headers and rows", async () => {
    const csv = `date,amount,description
2025-01-01,100,test!
2025-01-01,100,test!
`;
    const csvFile = createMockFile(csv);

    const data = await CsvParser.parse(csvFile);

    expect(data.headers).toEqual(["date", "amount", "description"]);
    expect(data.rows).toHaveLength(2);
  });

  it("should handle different delimiters (semicolon)", async () => {
    const csv = `date;amount;description
2024-01-01;100;Test`;
    const file = createMockFile(csv);
    const result = await CsvParser.parse(file);
    expect(result.headers).toEqual(["date", "amount", "description"]);
  });

  it("should handle quoted values with commas", async () => {
    const csv = `date,amount,description
2024-01-01,100,"Test, with comma"`;
    const file = createMockFile(csv);
    const result = await CsvParser.parse(file);
    expect(result.rows[0].description).toBe("Test, with comma");
  });

  it("should return empty array for CSV with only headers", async () => {
    const csv = `date,amount,description`;
    const file = createMockFile(csv);
    const result = await CsvParser.parse(file);
    expect(result.headers).toHaveLength(3);
    expect(result.rows).toHaveLength(0);
  });

  it("should throw error for invalid CSV format", async () => {
    const csv = `date,amount,description
2024-01-01,100`;
    const file = createMockFile(csv);
    await expect(CsvParser.parse(file)).rejects.toThrow(
      "Error al parsear CSV:",
    );
  });
});

describe("File types", () => {
  it("should throw error for invalid file type", async () => {
    const csv = `date,amount,description
2025-01-01,100,test!
2025-01-01,100,test!
`;
    const csvFile = createMockFile(csv, "invalid.xlsx");

    await expect(CsvParser.parse(csvFile)).rejects.toThrow(
      "File type not valid",
    );
  });

  it("should throw error for invalid mime type", async () => {
    const csv = `date,amount,description
2025-01-01,100,test!
2025-01-01,100,test!
`;
    const csvFile = createMockFile(csv, "invalid.html", "text/html");

    await expect(CsvParser.parse(csvFile)).rejects.toThrow(
      "File type not valid",
    );
  });

  it("should accept .csv files", async () => {
    const file = createMockFile("a,b,c", "data.csv");
    const result = await CsvParser.parse(file);
    expect(result).toBeDefined();
  });
  it("should accept text/csv mime type", async () => {
    const file = createMockFile("a,b,c", "csv.csv", "text/csv");

    const result = await CsvParser.parse(file);
    expect(result).toBeDefined();
  });
});
