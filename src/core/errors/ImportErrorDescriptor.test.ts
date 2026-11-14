import { describe, expect, it } from "vitest";
import {
  CsvParseError,
  EmptyFileError,
  FileReadError,
  InvalidCsvSchemaError,
  InvalidMappingError,
  MissingRequiredColumnError,
} from "./ImportErrors";
import { toImportErrorDescriptor } from "./ImportErrorDescriptor";

describe("toImportErrorDescriptor", () => {
  it.each([
    ["empty file", new EmptyFileError(), { code: "IMPORT_EMPTY_FILE" }],
    [
      "parse failure",
      new CsvParseError("bad csv"),
      { code: "IMPORT_PARSE_FAILED" },
    ],
    [
      "file read failure",
      new FileReadError(),
      { code: "IMPORT_FILE_READ_FAILED" },
    ],
    [
      "invalid schema",
      new InvalidCsvSchemaError(),
      { code: "IMPORT_INVALID_SCHEMA" },
    ],
    [
      "invalid mapping",
      new InvalidMappingError(),
      { code: "IMPORT_INVALID_MAPPING" },
    ],
    [
      "unknown cause",
      new Error("boom"),
      { code: "IMPORT_PARSE_FAILED" },
    ],
  ])("maps %s", (_label, cause, expected) => {
    expect(toImportErrorDescriptor(cause)).toEqual(expected);
  });

  it("preserves the missing column name as a param", () => {
    const descriptor = toImportErrorDescriptor(
      new MissingRequiredColumnError("date"),
    );

    expect(descriptor).toEqual({
      code: "IMPORT_MISSING_COLUMN",
      params: { column: "date" },
    });
  });
});
