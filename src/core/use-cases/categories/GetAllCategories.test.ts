import { describe, expect, it, vi } from "vitest";
import type { Category } from "@/core/entities/Category";
import type { ICategoryRepository } from "@/core/repositories/ICategoryRepository";
import { GetAllCategories } from "./GetAllCategories";

const createMockRepository = (): ICategoryRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  findAll: vi.fn().mockResolvedValue([]),
});

describe("GetAllCategories", () => {
  it("should call repository.findAll and return the result", async () => {
    const mockCategories: Category[] = [
      { id: "1", name: "Category 1", created_at: new Date("2024-01-01") },
      { id: "2", name: "Category 2", created_at: new Date("2024-01-02") },
    ];

    const mockRepository = createMockRepository();
    mockRepository.findAll = vi.fn().mockResolvedValue(mockCategories);

    const result = await GetAllCategories(mockRepository);

    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategories);
  });

  it("should return empty array when no categories exist", async () => {
    const mockRepository = createMockRepository();
    mockRepository.findAll = vi.fn().mockResolvedValue([]);

    const result = await GetAllCategories(mockRepository);

    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});
