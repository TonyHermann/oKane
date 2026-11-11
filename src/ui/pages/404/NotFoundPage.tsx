import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/ui/i18n";
import notFoundImage from "../../assets/img/404.png";
import "./404.css";
import "./notfoundpage.css";

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="notFound-container">
      <h2>{t("notFound.title")}</h2>
      <p>{t("notFound.body")}</p>

      <img src={notFoundImage} alt={t("notFound.imageAlt")} />
      <button
        type="button"
        onClick={() => {
          navigate("/");
        }}
      >
        {t("notFound.back")} <strong>{t("notFound.home")}</strong>
      </button>
    </div>
  );
};
