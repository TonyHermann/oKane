import type { CategoryState } from "@/ui/store/slices/categorySlices";
import type { Translate } from "@/ui/i18n/I18nProvider";

export function getCategoryLabel(
  storedCategory: CategoryState | null,
  categoriesById: Map<string, CategoryState>,
  t: Translate,
): string {
  if (!storedCategory) return t("transactions.categoryNone");

  return (
    categoriesById.get(storedCategory.id)?.name ??
    t("transactions.categoryDeleted")
  );
}
