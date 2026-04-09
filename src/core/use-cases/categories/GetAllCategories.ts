import type { ICategoryRepository } from "../../repositories/ICategoryRepository.js";
import type { Category } from "../../entities/Category.js";

export const GetAllCategories = async (
  repository: ICategoryRepository,
): Promise<Category[]> => {
  return repository.findAll();
};

