import { IndexedDBCategoryRepository } from "../infraestructure/persistence/IndexedDBCategoryRepository";

import { DeleteCategory } from "../core/use-cases/categories/DeleteCategory";
import { GetAllCategories } from "../core/use-cases/categories/GetAllCategories";
import { SaveCategory } from "../core/use-cases/categories/SaveCategory";
import { UpdateCategory } from "../core/use-cases/categories/UpdateCategory";

const repository = new IndexedDBCategoryRepository();

export const CategoryActions = {
  delete: DeleteCategory(repository),
  getAll: GetAllCategories(repository),
  save: SaveCategory(repository),
  update: UpdateCategory(repository),
};
