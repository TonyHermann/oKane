import type { ICategoryRepository } from "../../repositories/ICategoryRepository.js";
import type { Category } from "../../entities/Category.js";

export const SaveCategory = (repository: ICategoryRepository) => {
  return async (categoryData: Category) => {
    return repository.save(categoryData);
  };
};
