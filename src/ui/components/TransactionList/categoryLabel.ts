import type { CategoryState } from "@/ui/store/slices/categorySlices";
import type { Translate } from "@/ui/i18n/I18nProvider";

export function getCategoryLabel(
  categoryId: string | null,
  categoriesById: Map<string, CategoryState>,
  t: Translate,
): string {
  if (categoryId === null) return t("transactions.categoryNone");

  return (
    categoriesById.get(categoryId)?.name ?? t("transactions.categoryDeleted")
  );
}
