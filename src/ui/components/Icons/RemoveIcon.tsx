import removeIcon from "@ui/assets/img/remove.svg";
import { useTranslation } from "@/ui/i18n";

export const RemoveIcon = () => {
  const { t } = useTranslation();

  return (
    <div className="remove-icon">
      <img src={removeIcon} alt={t("common.remove")} />
    </div>
  );
};
