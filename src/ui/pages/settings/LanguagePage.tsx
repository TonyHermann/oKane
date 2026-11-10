import { Select } from "../../components/Select/Select";
import { isLocale, useTranslation } from "../../i18n";

const LANGUAGE_OPTIONS = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

export const LanguagePage = () => {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">{t("settings.languageRegion")}</div>
      </div>
      <div className="window-body">
        <Select
          id="settings-language"
          name="locale"
          label={t("settings.language")}
          value={locale}
          options={LANGUAGE_OPTIONS}
          onChange={(event) => {
            const { value } = event.target;

            if (isLocale(value)) {
              setLocale(value);
            }
          }}
        />
      </div>
    </div>
  );
};
