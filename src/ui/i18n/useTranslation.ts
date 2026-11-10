import { useContext } from "react";
import { I18nContext, type I18nValue } from "./I18nProvider";

export const useTranslation = (): I18nValue => {
  const context = useContext(I18nContext);

  if (context === null) {
    throw new Error(
      "useTranslation must be used within an I18nProvider. Wrap the tree with <I18nProvider>.",
    );
  }

  return context;
};
