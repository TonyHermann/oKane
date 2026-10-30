import { describe, expect, it } from "vitest";
import type { CategoryState } from "@/ui/store/slices/categorySlices";
import { getCategoryLabel } from "./categoryLabel";

const category = (
  overrides: Partial<CategoryState> = {},
): CategoryState => ({
  id: "cat-1",
  name: "Comida",
  created_at: 1,
  ...overrides,
});

describe("getCategoryLabel", () => {
  it("returns Sin categoría when the transaction has no category", () => {
    const categoriesById = new Map<string, CategoryState>();

    expect(getCategoryLabel(null, categoriesById)).toBe("Sin categoría");
  });

  it("returns the current category name when the category still exists", () => {
    const storedCategory = category({ name: "Nombre antiguo" });
    const currentCategory = category({ name: "Comida" });
    const categoriesById = new Map([[currentCategory.id, currentCategory]]);

    expect(getCategoryLabel(storedCategory, categoriesById)).toBe("Comida");
  });

  it("returns Categoría eliminada when the stored category no longer exists", () => {
    const storedCategory = category();
    const categoriesById = new Map<string, CategoryState>();

    expect(getCategoryLabel(storedCategory, categoriesById)).toBe(
      "Categoría eliminada",
    );
  });
});
