import { describe, expect, it } from "vitest";
import {
  DuplicateEntityError,
  EntityNotFoundError,
  ValidationError,
} from "./DomainErrors";
import {
  InvalidCsvSchemaError,
  InvalidMappingError,
  MissingRequiredColumnError,
} from "./ImportErrors";
import { resolveErrorCode, toErrorCode } from "./toErrorCode";

describe("toErrorCode", () => {
  it.each([
    ["validation", new ValidationError("invalid"), "VALIDATION_FAILED"],
    [
      "invalid csv schema",
      new InvalidCsvSchemaError(),
      "TRANSACTIONS_IMPORT_FAILED",
    ],
    [
      "missing required column",
      new MissingRequiredColumnError("date"),
      "TRANSACTIONS_IMPORT_FAILED",
    ],
    [
      "invalid mapping",
      new InvalidMappingError(),
      "TRANSACTIONS_IMPORT_FAILED",
    ],
    [
      "entity not found",
      new EntityNotFoundError("Category", "cat-1"),
      "UNKNOWN",
    ],
    [
      "duplicate entity",
      new DuplicateEntityError("Category", "name", "Food"),
      "UNKNOWN",
    ],
    ["plain error", new Error("offline"), "UNKNOWN"],
    ["non-error value", "boom", "UNKNOWN"],
    ["null", null, "UNKNOWN"],
  ])("maps %s to %s", (_label, cause, expected) => {
    expect(toErrorCode(cause)).toBe(expected);
  });
});

describe("resolveErrorCode", () => {
  it.each([
    ["explicit code", "DATA_UPDATE_FAILED", "DATA_SAVE_FAILED", "DATA_UPDATE_FAILED"],
    ["unknown code", "UNKNOWN", "DATA_SAVE_FAILED", "DATA_SAVE_FAILED"],
    ["missing payload", undefined, "DATA_LOAD_FAILED", "DATA_LOAD_FAILED"],
    ["foreign payload", "ERR_UNKNOWN", "DATA_DELETE_FAILED", "DATA_DELETE_FAILED"],
    ["non-string payload", { code: "VALIDATION_FAILED" }, "DATA_SAVE_FAILED", "DATA_SAVE_FAILED"],
  ] as const)(
    "resolves %s to %s",
    (_label, payload, fallback, expected) => {
      expect(resolveErrorCode(payload, fallback)).toBe(expected);
    },
  );
});
