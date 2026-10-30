import { describe, expect, it } from "vitest";
import { FileValidator } from "./FileValidator";

describe("FileValidator", () => {
  describe("isValidType", () => {
    it("should accept an allowed MIME type", () => {
      expect(
        FileValidator.isValidType(["text/csv", "text/plain"], "text/csv"),
      ).toBe(true);
    });

    it("should reject a disallowed MIME type", () => {
      expect(
        FileValidator.isValidType(["text/csv", "text/plain"], "text/html"),
      ).toBe(false);
    });
  });
});
