import editIcon from "@ui/assets/img/tag-edit.svg";
import { useTranslation } from "@/ui/i18n";

export const EditIcon = () => {
  const { t } = useTranslation();

  return (
    <div className="edit-icon">
      <img src={editIcon} alt={t("common.edit")} />
    </div>
  );
};
