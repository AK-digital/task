import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: "fr",
    debug: process.env.NODE_ENV === "development",
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  });

// Fonction pour initialiser la langue depuis les données utilisateur
export function initializeLanguageFromUser(userLanguage) {
  if (userLanguage && ["fr", "en"].includes(userLanguage)) {
    i18n.changeLanguage(userLanguage);
  }
}

export default i18n;
