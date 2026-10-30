import { describe, it, expect } from "vitest";
import { PapaCsvParser } from "@/infraestructure/parsers/PapaCsvParser";

// Helpers
const createMockFile = (
  content: string,
  filename: string = "test.csv",
  type: string = "text/csv",
): File => {
  const blob = new Blob([content], { type });
  return new File([blob], filename);
};

describe("PapaCsvParser", () => {
  it("should parse a proper csv with headers and rows", async () => {
    const csv = `date,amount,description
2025-01-01,100,test!
2025-01-01,100,test!
`;
    const csvFile = createMockFile(csv);

    const data = await PapaCsvParser.parse(await csvFile.text());

    expect(data.headers).toEqual(["date", "amount", "description"]);
    expect(data.rows).toHaveLength(2);
  });

  it("should handle different delimiters (semicolon)", async () => {
    const csv = `date;amount;description
2024-01-01;100;Test`;
    const csvFile = createMockFile(csv);
    const result = await PapaCsvParser.parse(await csvFile.text());
    expect(result.headers).toEqual(["date", "amount", "description"]);
  });

  it("should handle quoted values with commas", async () => {
    const csv = `date,amount,description
2024-01-01,100,"Test, with comma"`;
    const csvFile = createMockFile(csv);
    const result = await PapaCsvParser.parse(await csvFile.text());
    expect(result.rows[0].description).toBe("Test, with comma");
  });

  it("should return empty array for CSV with only headers", async () => {
    const csv = `date,amount,description`;
    const csvFile = createMockFile(csv);
    const result = await PapaCsvParser.parse(await csvFile.text());
    expect(result.headers).toHaveLength(3);
    expect(result.rows).toHaveLength(0);
  });

  it("should throw error for invalid CSV format", async () => {
    const csv = `date,amount,description
2024-01-01,100`;
    const csvFile = createMockFile(csv);
    await expect(PapaCsvParser.parse(await csvFile.text())).rejects.toThrow(
      "Error al parsear CSV:",
    );
  });
});
