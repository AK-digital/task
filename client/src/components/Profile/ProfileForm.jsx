"use client";
import {
  useActionState,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { updateUserProfile, updateUserLanguage } from "@/actions/user";
import { translateCustomErrors } from "@/utils/zod";
import { mutate } from "swr";
import { AuthContext } from "@/context/auth";
import PopupMessage from "@/layouts/PopupMessage";
import { useTranslation } from "react-i18next";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProfileForm() {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useContext(AuthContext);

  const [state, formAction, pending] = useActionState(
    updateUserProfile,
    initialState
  );
  const [popUp, setPopup] = useState(null);
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  // Ajout des états pour gérer les champs actifs
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [company, setCompany] = useState(user?.company || "");
  const [position, setPosition] = useState(user?.position || "");
  const [language, setLanguage] = useState(user?.language || "fr");

  // Fonction pour gérer le changement de langue côté client uniquement
  const handleLanguageChange = useCallback(
    async (lng) => {
      setIsUpdatingLanguage(true);

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

        // Afficher un message de succès
        setPopup({
          status: "success",
          title: t("profile.success_title"),
          message: t(response.message),
        });
      } else {
        // En cas d'erreur, revenir à la langue précédente
        await i18n.changeLanguage(user?.language || "fr");

        setPopup({
          status: "failure",
          title: t("profile.error_title"),
          message: t(response.message),
        });
      }

      setIsUpdatingLanguage(false);
    },
    [user, i18n, setUser, t]
  );

  useEffect(() => {
    // Mutate the session data if the update was successful
    if (state?.status === "success") {
      mutate("/auth/session");

      setPopup({
        status: state?.status,
        title: t("profile.success_title"),
        message: t(state.message),
      });
    }

    if (state?.status === "failure") {
      setPopup({
        status: state?.status,
        title: t("profile.error_title"),
        message: t(state.message),
      });
    }

    // Hide the popup after 4 seconds
    const timeout = setTimeout(() => setPopup(false), 4000);

    return () => clearTimeout(timeout);
  }, [state, t]);

  // Mettre à jour les états avec les valeurs de l'utilisateur lorsque les données sont chargées
  useEffect(() => {
    if (user) {
      setLastName(user.lastName || "");
      setFirstName(user.firstName || "");
      setCompany(user.company || "");
      setPosition(user.position || "");
      setLanguage(user.language || "fr");
    }
  }, [user]);

  // Détecter les changements de langue et les traiter séparément
  const handleLanguageSelectChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);

    // Appeler directement handleLanguageChange, user.js se charge des vérifications
    handleLanguageChange(newLanguage);
  };

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="userId" defaultValue={user?._id} />

        <div className="form-group">
          <label
            className="select-none"
            htmlFor="firstName"
            data-active={firstName ? true : false}
          >
            {t("profile.first_name")}
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            defaultValue={user?.firstName || ""}
            onChange={(e) => setFirstName(e.target.value)}
            className="font-bricolage text-medium focus:outline-none"
          />
          {state?.errors?.firstName && <span>{state.errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label
            className="select-none"
            htmlFor="lastName"
            data-active={lastName ? true : false}
          >
            {t("profile.last_name")}
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            defaultValue={user?.lastName || ""}
            onChange={(e) => setLastName(e.target.value)}
            className="font-bricolage text-medium focus:outline-none"
          />
          {state?.errors?.lastName && (
            <span>{translateCustomErrors(state.errors.lastName, t)}</span>
          )}
        </div>

        <div className="form-group">
          <label
            className="select-none"
            htmlFor="company"
            data-active={company ? true : false}
          >
            {t("profile.company")}
          </label>
          <input
            type="text"
            id="company"
            name="company"
            defaultValue={user?.company || ""}
            onChange={(e) => setCompany(e.target.value)}
            className="font-bricolage text-medium focus:outline-none"
          />
          {state?.errors?.company && (
            <span>{translateCustomErrors(state.errors.company, t)}</span>
          )}
        </div>

        <div className="form-group">
          <label
            className="select-none"
            htmlFor="position"
            data-active={position ? true : false}
          >
            {t("profile.position")}
          </label>
          <input
            type="text"
            id="position"
            name="position"
            defaultValue={user?.position || ""}
            onChange={(e) => setPosition(e.target.value)}
            className="font-bricolage text-medium focus:outline-none"
          />
          {state?.errors?.position && (
            <span>{translateCustomErrors(state.errors.position, t)}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="language" data-active={true}>
            {t("profile.language")}
          </label>
          <select
            name="language"
            id="language"
            value={language}
            onChange={handleLanguageSelectChange}
            disabled={pending || isUpdatingLanguage}
            className="border-b border-b-text-lighter-color text-text-lighter-color text-medium bg-transparent"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
          {isUpdatingLanguage && (
            <span className="text-accent-color text-small">
              {t("profile.updating_language")}
            </span>
          )}
        </div>
        <button
          type="submit"
          data-disabled={pending}
          className="font-bricolage ml-auto mt-6"
        >
          {t("profile.update_button")}
        </button>
      </form>

      {popUp && (
        <PopupMessage
          status={popUp.status}
          title={popUp.title}
          message={popUp.message}
        />
      )}
    </>
  );
}
