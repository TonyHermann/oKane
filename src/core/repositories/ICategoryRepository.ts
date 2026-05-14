import { Category } from "../entities/Category";

export interface ICategoryRepository {
  save(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Category[]>;
}
