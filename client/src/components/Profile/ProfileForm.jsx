"use client";
import { useActionState, useContext, useEffect, useState } from "react";
import { updateUserProfile } from "@/actions/user";
import { translateValidationErrors } from "@/utils/zod";
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
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const updateUserProfileWithT = (prevState, formData) =>
    updateUserProfile(t, prevState, formData);
  const [state, formAction, pending] = useActionState(
    updateUserProfileWithT,
    initialState
  );
  const [popUp, setPopup] = useState(null);

  // Ajout des états pour gérer les champs actifs
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [company, setCompany] = useState(user?.company || "");
  const [position, setPosition] = useState(user?.position || "");
  const [language, setLanguage] = useState(user?.language || "fr");

  useEffect(() => {
    // Mutate the session data if the update was successful
    if (state?.status === "success") {
      mutate("/auth/session");
      setPopup({
        status: state?.status,
        title: t("profile.success_title"),
        message: t("profile.update_success"),
      });
    }

    if (state?.status === "failure") {
      setPopup({
        status: state?.status,
        title: t("profile.error_title"),
        message: t("profile.update_error"),
      });
    }

    // Hide the popup after 4 seconds
    const timeout = setTimeout(() => setPopup(false), 4000);

    return () => clearTimeout(timeout);
  }, [state]);

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
            <span>{translateValidationErrors(state.errors.lastName, t)}</span>
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
            <span>{translateValidationErrors(state.errors.company, t)}</span>
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
            <span>{translateValidationErrors(state.errors.position, t)}</span>
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
            onChange={(e) => setLanguage(e.target.value)}
            disabled={pending}
            className="border-b border-b-text-lighter-color text-text-lighter-color text-medium bg-transparent"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
          {translateValidationErrors(state?.errors?.language, t) && (
            <span className="text-state-blocked-color text-small">
              {translateValidationErrors(state?.errors?.language, t)}
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
