import type { CategoryState } from "@/ui/store/slices/categorySlices";

export function getCategoryLabel(
  categoryId: string | null,
  categoriesById: Map<string, CategoryState>,
): string {
  if (categoryId === null) return "Sin categoría";

  return categoriesById.get(categoryId)?.name ?? "Categoría eliminada";
}
