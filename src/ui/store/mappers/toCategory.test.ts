import { describe, expect, it } from "vitest";
import { Category } from "@/core/entities/Category";
import type { CategoryState } from "../slices/categorySlices";
import { createCategory, toCategory, toCategoryState } from "./toCategory";

describe("createCategory", () => {
  it("creates a Category entity with trimmed name, id and numeric created_at", () => {
    const category = createCategory({ name: "  Comida  " });

    expect(category).toBeInstanceOf(Category);
    expect(category.name).toBe("Comida");
    expect(category.id.length).toBeGreaterThan(0);
    expect(category.created_at).toBeTypeOf("number");
  });

  it("keeps an already trimmed name unchanged", () => {
    const category = createCategory({ name: "Transporte" });

    expect(category.name).toBe("Transporte");
    expect(category.created_at).toBeGreaterThan(0);
  });
});

describe("toCategory → toCategoryState round-trip", () => {
  it("preserves id, name and created_at unchanged", () => {
    const state: CategoryState = {
      id: "cat-1",
      name: "Comida",
      created_at: new Date("2024-01-01").getTime(),
    };

    const roundTripped = toCategoryState(toCategory(state));

    expect(roundTripped).toEqual(state);
  });
});