import { ASCIIConverter } from "@/ui/components/ASCIIConverter/ASCIIConverter";
import { useTranslation } from "../../i18n";

export const AsciiPage = () => {
  const { t } = useTranslation();

  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">{t("settings.ascii")}</div>
      </div>
      <div className="window-body">
        <ASCIIConverter />
      </div>
    </div>
  );
};
