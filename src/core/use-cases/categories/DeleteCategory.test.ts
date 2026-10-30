import { describe, expect, it, vi } from "vitest";
import type { ICategoryRepository } from "@/core/repositories/ICategoryRepository";
import { DeleteCategory } from "./DeleteCategory";

const createMockRepository = (): ICategoryRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  findAll: vi.fn().mockResolvedValue([]),
});

describe("DeleteCategory", () => {
  it("should call repository.delete with id", async () => {
    const mockRepository = createMockRepository();
    const deleteCategory = await DeleteCategory(mockRepository);

    await deleteCategory("1");

    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    expect(mockRepository.delete).toHaveBeenCalledWith("1");
  });
});
