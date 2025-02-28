"use client";
import styles from "@/styles/components/profile/profile-form.module.css";
import { useActionState, useContext, useEffect, useState } from "react";
import { updateUserProfile } from "@/actions/user";
import { bricolageGrostesque } from "@/utils/font";
import { mutate } from "swr";
import { AuthContext } from "@/context/auth";
import PopupMessage from "@/layouts/PopupMessage";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProfileForm() {
  const { user } = useContext(AuthContext);
  const [state, formAction, pending] = useActionState(
    updateUserProfile,
    initialState
  );
  const [popUp, setPopup] = useState(null);

  useEffect(() => {
    // Mutate the session data if the update was successful
    if (state?.status === "success") {
      mutate("/auth/session");
      setPopup({
        status: state?.status,
        title: "Succès",
        message: "Profil mis à jour avec succès",
      });
    }

    if (state?.status === "failure") {
      setPopup({
        status: state?.status,
        title: "Erreur",
        message: "Une erreur s'est produite lors de la mise à jour du profil",
      });
    }

    // Hide the popup after 4 seconds
    const timeout = setTimeout(() => setPopup(false), 4000);

    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="userId" defaultValue={user?._id} />
        <div className={styles.formGroup}>
          <label htmlFor="lastName">Nom</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            defaultValue={user?.lastName || ""}
            className={`${bricolageGrostesque.className} ${styles.input}`}
          />
          {state?.errors?.lastName && (
            <span className={styles.error}>{state.errors.lastName}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="firstName">Prénom</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            defaultValue={user?.firstName || ""}
            className={`${bricolageGrostesque.className} ${styles.input}`}
          />
          {state?.errors?.firstName && (
            <span className={styles.error}>{state.errors.firstName}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="company">Entreprise</label>
          <input
            type="text"
            id="company"
            name="company"
            defaultValue={user?.company || ""}
            className={`${bricolageGrostesque.className} ${styles.input}`}
          />
          {state?.errors?.company && (
            <span className={styles.error}>{state.errors.company}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="position">Poste</label>
          <input
            type="text"
            id="position"
            name="position"
            defaultValue={user?.position || ""}
            className={`${bricolageGrostesque.className} ${styles.input}`}
          />
          {state?.errors?.position && (
            <span className={styles.error}>{state.errors.position}</span>
          )}
        </div>
        <button
          type="submit"
          className={`${bricolageGrostesque.className} ${styles.submitBtn}`}
          data-disabled={pending}
        >
          Mettre à jour
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
