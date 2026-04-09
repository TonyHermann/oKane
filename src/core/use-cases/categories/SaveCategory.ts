import type { ICategoryRepository } from "../../repositories/ICategoryRepository.js";
import type { Category } from "../../entities/Category.js";

export const SaveCategory = async (repository: ICategoryRepository) => {
  return async (categoryData: Category) => {
    return repository.save(categoryData);
  };
};

