import type { CategoryState } from "@/ui/store/slices/categorySlices";

export function getCategoryLabel(
  storedCategory: CategoryState | null,
  categoriesById: Map<string, CategoryState>,
): string {
  if (!storedCategory) return "Sin categoría";

  return categoriesById.get(storedCategory.id)?.name ?? "Categoría eliminada";
}
