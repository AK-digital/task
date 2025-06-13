import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import { setupZodI18n } from "@/utils/zod";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: "fr",
    debug: process.env.NODE_ENV === "development",
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
      requestOptions: {
        cache: "no-store",
      },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  })
  .then(() => {
    // Initialiser Zod avec les traductions après que i18next soit prêt
    setupZodI18n();
  });

// Fonction pour initialiser la langue depuis les données utilisateur
export function initializeLanguageFromUser(userLanguage) {
  if (userLanguage && ["fr", "en"].includes(userLanguage)) {
    i18n.changeLanguage(userLanguage);
  }
}

export default i18n;
