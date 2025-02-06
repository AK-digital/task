"use client";
import styles from "@/styles/components/profile/profile-form.module.css";
import { useState, useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { updateUserPicture, updateUserProfile } from "@/actions/user";
import { instrumentSans } from "@/utils/font";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProfileForm({ user }) {
  const pictureFormRef = useRef(null);
  const updateUserPictureWithId = updateUserPicture.bind(null, user?._id);
  const [pictureState, pictureFormAction, picturePending] = useActionState(
    updateUserPictureWithId,
    initialState
  );
  const [profileState, profileFormAction, profilePending] = useActionState(
    updateUserProfile,
    initialState
  );

  const [editImg, setEditImg] = useState(false);

  useEffect(() => {
    if (pictureState?.status === "success") {
      mutate("/auth/session");
    }
  }, [pictureState]);

  const handleUpdatePicture = () => {
    pictureFormRef.current.requestSubmit();
  };

  return (
    <div className={styles.container}>
      {/* Section photo de profil */}
      <form
        action={pictureFormAction}
        ref={pictureFormRef}
        className={styles.pictureForm}
      >
        <input type="hidden" name="userId" value={user?._id} />
        <div
          className={styles.picture}
          onMouseEnter={() => setEditImg(true)}
          onMouseLeave={() => setEditImg(false)}
        >
          <Image
            src={user?.picture || "/default-pfp.webp"}
            alt={`Photo de profil de ${user?.firstName}`}
            width={120}
            height={120}
            quality={100}
            className={styles.profileImage}
          />
          {editImg && (
            <label htmlFor="picture" className={styles.editPicture}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </label>
          )}
          <input
            type="file"
            name="picture"
            id="picture"
            hidden
            onChange={handleUpdatePicture}
          />
        </div>
      </form>

      {/* Formulaire principal */}
      <form action={profileFormAction}>
        <input type="hidden" name="userId" value={user?._id} />

        <div className={styles.formGroup}>
          <label htmlFor="lastName">Nom</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            defaultValue={user?.lastName}
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
            defaultValue={user?.firstName}
            className={`${instrumentSans.className} ${styles.input}`}
          />
          {profileState?.errors?.firstName && (
            <span className={styles.error}>
              {profileState.errors.firstName}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="company">Entreprise</label>
          <input
            type="text"
            id="company"
            name="company"
            defaultValue={user?.company}
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
            defaultValue={user?.position}
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

        {profileState?.message && (
          <p
            className={
              profileState.status === "success" ? styles.success : styles.error
            }
          >
            {profileState.message}
          </p>
        )}
      </form>
    </div>
  );
}
