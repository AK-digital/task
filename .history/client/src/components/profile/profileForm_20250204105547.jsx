"use client";
import styles from "@/styles/components/profile/profile-form.module.css";
import { useActionState, useEffect } from "react";

import { updateUserProfile } from "@/actions/user";
import { instrumentSans } from "@/utils/font";
import { mutate } from "swr";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProfileForm({ user }) {
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
      <input type="hidden" name="userId" value={user?._id} />

      <div className={styles.formGroup}>
        <label htmlFor="lastName">Nom</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          defaultValue={user?.lastName || ""}
          className={`${instrumentSans.className} ${styles.input}`}
        />
        {profileState?.errors?.lastName && (
          <span className={styles.error}>{profileState.errors.lastName}</span>
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
        {profileState?.errors?.firstName && (
          <span className={styles.error}>{profileState.errors.firstName}</span>
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
        {profileState?.errors?.company && (
          <span className={styles.error}>{profileState.errors.company}</span>
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
        {profileState?.errors?.position && (
          <span className={styles.error}>{profileState.errors.position}</span>
        )}
      </div>
      <button
        type="submit"
        className={`${instrumentSans.className} ${styles.submitBtn}`}
        data-disabled={profilePending}
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
