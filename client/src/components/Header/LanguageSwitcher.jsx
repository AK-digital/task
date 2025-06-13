"use client";

import { useTranslation } from "react-i18next";
import { useContext, useCallback } from "react";
import { AuthContext } from "@/context/auth";
import { updateUserLanguage } from "@/actions/user";
import { mutate } from "swr";
import styles from "@/styles/components/header/language-switcher.module.css";

const SUPPORTED_LANGUAGES = ["fr", "en"];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);

  const changeLanguage = useCallback(
    async (lng) => {
      if (!user?._id || lng === user?.language) return;

      try {
        // Changer immédiatement la langue dans i18n pour l'UX
        await i18n.changeLanguage(lng);

        // Mettre à jour en base de données via l'action
        const response = await updateUserLanguage(user._id, lng);

        if (response?.status === "success") {
          // Mettre à jour le contexte utilisateur
          setUser((prevUser) => ({
            ...prevUser,
            language: lng,
          }));

          // Revalider la session pour s'assurer que tout est synchronisé
          mutate("/auth/session");
        } else {
          // En cas d'erreur retournée par l'action
          console.error(t(response.message));
          throw new Error(response.message);
        }
      } catch (error) {
        console.error(t("profile.language.update.error"), error);
        // En cas d'erreur, revenir à la langue précédente
        await i18n.changeLanguage(user?.language || "fr");
      }
    },
    [user, i18n, setUser]
  );

  const currentLanguage = user?.language || i18n.language || "fr";

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
