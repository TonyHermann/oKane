import { useTranslation } from "@/ui/i18n";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="glass">
      <div>
        <p>
          {t("footer.developedBy")}
          <a href="https://github.com/TonyHermann/" target="_blank" rel="noreferrer">
            @TonyHermann
          </a>
          ~竹
        </p>
      </div>
    </footer>
  );
};
