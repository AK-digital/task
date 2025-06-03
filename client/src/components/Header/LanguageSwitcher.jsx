"use client";

import { useTranslation } from "react-i18next";
import styles from "@/styles/components/header/language-switcher.module.css";

const SUPPORTED_LANGUAGES = ["fr", "en"];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language || "fr";

  return (
    <div className={styles.container}>
      <div className={styles.switcher}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`${styles.langButton} ${
              currentLanguage === lang ? styles.active : ""
            }`}
            aria-label={`${t(
              "general.change_language_to"
            )} ${lang.toUpperCase()}`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
