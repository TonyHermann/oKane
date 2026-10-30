import { Category } from "@/core/entities/Category";
import type {
  CategoryState,
  CreateCategoryState,
} from "../slices/categorySlices";

export const createCategory = (state: CreateCategoryState): Category => {
  return Category.Create({ name: state.name });
};

export const toCategory = (state: CategoryState): Category => {
  return Category.Rehydrate({
    id: state.id,
    name: state.name,
    created_at: state.created_at,
  });
};

export const toCategoryState = (category: Category): CategoryState => {
  return {
    id: category.id,
    name: category.name,
    created_at: category.created_at,
  };
};