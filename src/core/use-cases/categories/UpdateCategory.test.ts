import { describe, expect, it, vi } from "vitest";
import { Category } from "@/core/entities/Category";
import type { ICategoryRepository } from "@/core/repositories/ICategoryRepository";
import { UpdateCategory } from "./UpdateCategory";

const createMockRepository = (): ICategoryRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  findAll: vi.fn().mockResolvedValue([]),
});

describe("UpdateCategory", () => {
  it("should call repository.update when category is valid", async () => {
    const mockRepository = createMockRepository();
    const updateCategory = await UpdateCategory(mockRepository);

    const category = Category.Create({ name: "Updated Category" });

    await updateCategory(category);

    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(mockRepository.update).toHaveBeenCalledWith(category);
  });
});
