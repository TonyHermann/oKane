import { describe, expect, it } from "vitest";
import { CsvSchema } from "../entities/Import/CsvSchema";
import { MissingRequiredColumnError } from "../errors/ImportErrors";
import { csvSchemaValidator } from "./CsvSchemaValidator";

describe("csvSchemaValidator", () => {
  it("accepts headers that contain every required column", () => {
    expect(() =>
      csvSchemaValidator.validate(
        ["date", "amount", "description"],
        new CsvSchema(["date", "amount", "description"]),
      ),
    ).not.toThrow();
  });

  it("reports the first missing required column by name", () => {
    try {
      csvSchemaValidator.validate(
        ["date", "amount"],
        new CsvSchema(["date", "amount", "description"]),
      );
      expect.unreachable("validate should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(MissingRequiredColumnError);
      expect((error as MissingRequiredColumnError).details).toBe(
        "description",
      );
    }
  });
});
