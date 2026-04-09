import type { ICategoryRepository } from "../../repositories/ICategoryRepository.js";

export const DeleteCategory = async (repository: ICategoryRepository) => {
  return async (categoryId: string) => {
    return repository.delete(categoryId);
  };
};

