import type { ICategoryRepository } from "../../repositories/ICategoryRepository.js";
import type { Category } from "../../entities/Category.js";

export const GetAllCategories =
  (repository: ICategoryRepository) => async (): Promise<Category[]> => {
    return repository.findAll();
  };
