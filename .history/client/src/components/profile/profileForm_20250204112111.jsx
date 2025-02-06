"use client";
import styles from "@/styles/components/profile/profile-form.module.css";
import { useActionState, useContext, useEffect } from "react";
import { updateUserProfile } from "@/actions/user";
import { instrumentSans } from "@/utils/font";
import { mutate } from "swr";
import { AuthContext } from "@/context/auth";

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

  useEffect(() => {
    if (state?.status === "success") {
      mutate("/auth/session");
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" defaultValue={user?._id} />

      <div className={styles.formGroup}>
        <label htmlFor="lastName">Nom</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          defaultValue={user?.lastName || ""}
          className={`${instrumentSans.className} ${styles.input}`}
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
          className={`${instrumentSans.className} ${styles.input}`}
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
          className={`${instrumentSans.className} ${styles.input}`}
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
          className={`${instrumentSans.className} ${styles.input}`}
        />
        {state?.errors?.position && (
          <span className={styles.error}>{state.errors.position}</span>
        )}
      </div>
      <button
        type="submit"
        className={`${instrumentSans.className} ${styles.submitBtn}`}
        data-disabled={pending}
      >
        Mettre à jour
      </button>

      {/* {(profileState?.message || pictureState?.message) && (
          <p
            className={
              profileState.status === "success" ||
              pictureState?.status === "success"
                ? styles.success
                : styles.error
            }
          >
            {profileState.message}
          </p>
        )} */}
    </form>
  );
}
