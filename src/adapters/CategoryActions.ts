import { IndexedDBCategoryRepository } from "../infraestructure/persistence/IndexedDBCategoryRepository.js";

import { DeleteCategory } from "../core/use-cases/categories/DeleteCategory.js";
import { GetAllCategories } from "../core/use-cases/categories/GetAllCategories.js";
import { SaveCategory } from "../core/use-cases/categories/SaveCategory.js";
import { UpdateCategory } from "../core/use-cases/categories/UpdateCategory.js";

const repository = new IndexedDBCategoryRepository();

export const CategoryActions = {
  delete: DeleteCategory(repository),
  getAll: GetAllCategories(repository),
  save: SaveCategory(repository),
  update: UpdateCategory(repository),
};
