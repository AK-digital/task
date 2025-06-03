"use client";
import styles from "@/styles/components/profile/profile-form.module.css";
import { useActionState, useContext, useEffect, useState } from "react";
import { updateUserProfile } from "@/actions/user";
import { bricolageGrostesque } from "@/utils/font";
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

  const updateUserProfileWithT = updateUserProfile.bind(null, t);
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
    }
  }, [user]);

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="userId" defaultValue={user?._id} />

        <div className="form-group">
          <label htmlFor="firstName" data-active={firstName ? true : false}>
            {t("profile.first_name")}
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            defaultValue={user?.firstName || ""}
            className={`${bricolageGrostesque.className} ${styles.input}`}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {state?.errors?.firstName && (
            <span className={styles.error}>
              {translateValidationErrors(state.errors.firstName, t)}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" data-active={lastName ? true : false}>
            {t("profile.last_name")}
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            defaultValue={user?.lastName || ""}
            className={`${bricolageGrostesque.className} ${styles.input}`}
            onChange={(e) => setLastName(e.target.value)}
          />
          {state?.errors?.lastName && (
            <span className={styles.error}>
              {translateValidationErrors(state.errors.lastName, t)}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="company" data-active={company ? true : false}>
            {t("profile.company")}
          </label>
          <input
            type="text"
            id="company"
            name="company"
            defaultValue={user?.company || ""}
            className={`${bricolageGrostesque.className} ${styles.input}`}
            onChange={(e) => setCompany(e.target.value)}
          />
          {state?.errors?.company && (
            <span className={styles.error}>
              {translateValidationErrors(state.errors.company, t)}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="position" data-active={position ? true : false}>
            {t("profile.position")}
          </label>
          <input
            type="text"
            id="position"
            name="position"
            defaultValue={user?.position || ""}
            className={`${bricolageGrostesque.className} ${styles.input}`}
            onChange={(e) => setPosition(e.target.value)}
          />
          {state?.errors?.position && (
            <span className={styles.error}>
              {translateValidationErrors(state.errors.position, t)}
            </span>
          )}
        </div>
        <button
          type="submit"
          className={`${bricolageGrostesque.className} ${styles.submitBtn}`}
          data-disabled={pending}
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
