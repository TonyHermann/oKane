import type { ICategoryRepository } from "../../repositories/ICategoryRepository.js";

export const DeleteCategory = (repository: ICategoryRepository) => {
  return async (categoryId: string) => {
    return repository.delete(categoryId);
  };
};
