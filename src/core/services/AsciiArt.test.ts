import { describe, expect, it } from "vitest";
import {
  ASCII_PRESETS,
  BRAILLE_RAMP,
  charFor,
  DEFAULT_RAMP,
  isAsciiPresetId,
} from "./AsciiArt";

describe("AsciiArt presets", () => {
  it("maps the darkest brightness to the first braille glyph", () => {
    expect(charFor(0, BRAILLE_RAMP)).toBe("⣿");
  });

  it("maps the lightest brightness to the last braille glyph", () => {
    expect(charFor(255, BRAILLE_RAMP)).toBe(" ");
  });

  it("keeps the classic preset on the existing ramp", () => {
    expect(ASCII_PRESETS.classic).toBe(DEFAULT_RAMP);
  });

  it("accepts known preset ids and rejects unknown ones", () => {
    expect(isAsciiPresetId("classic")).toBe(true);
    expect(isAsciiPresetId("braille")).toBe(true);
    expect(isAsciiPresetId("unknown")).toBe(false);
  });
});
