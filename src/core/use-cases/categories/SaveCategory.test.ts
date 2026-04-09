import { describe, expect, it, vi } from "vitest";
import { Category } from "@/core/entities/Category";
import type { ICategoryRepository } from "@/core/repositories/ICategoryRepository";
import { SaveCategory } from "./SaveCategory";

const createMockRepository = (): ICategoryRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  findAll: vi.fn().mockResolvedValue([]),
});

describe("SaveCategory", () => {
  it("should call repository.save when category is valid", async () => {
    const mockRepository = createMockRepository();
    const saveCategory = await SaveCategory(mockRepository);

    const category = new Category("1", "Test Category", new Date("2024-01-01"));

    await saveCategory(category);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(category);
  });
});
