"use client";
import styles from "@/styles/components/profile/profile-form.module.css";
import { useState, useRef } from "react";
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
  const updateUserPictureWithId = updateUserPicture.bind(null, user?._id);
  const [state, formAction, pending] = useActionState(
    updateUserPictureWithId,
    initialState
  );

  const [editImg, setEditImg] = useState(false);
  const router = useRouter();
  const pictureFormRef = useRef(null);

  const handleSubmit = async (formData) => {
    try {
      const result = await updateUserProfile(null, formData);
      setState(result);
      if (result.status === "success") {
        router.refresh();
      }
    } catch (error) {
      setState({
        status: "error",
        message: "Une erreur s'est produite",
        errors: error,
      });
    }
  };

  const handlePictureSubmit = async (formData) => {
    try {
      const result = await updateUserPicture(null, formData);
      setState(result);
      if (result.status === "success") {
        router.refresh();
      }
    } catch (error) {
      setState({
        status: "error",
        message: "Une erreur s'est produite",
        errors: error,
      });
    }
  };

  useEffect(() => {
    if (state?.status === "success") {
      mutate("/auth/session");
    }
  }, [state]);

  function handleUpdateUpdatePicture() {
    form.current.requestSubmit();
  }

  const handleUpdatePicture = () => {
    pictureFormRef.current.requestSubmit();
  };

  return (
    <div className={styles.container}>
      {/* Section photo de profil */}
      <form
        action={handlePictureSubmit}
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
            onChange={handleUpdateUpdatePicture}
          />
        </div>
      </form>

      {/* Formulaire principal */}
      <form action={handleSubmit}>
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
            defaultValue={user?.firstName}
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
            defaultValue={user?.company}
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
            defaultValue={user?.position}
            className={`${instrumentSans.className} ${styles.input}`}
          />
          {state?.errors?.position && (
            <span className={styles.error}>{state.errors.position}</span>
          )}
        </div>

        <button
          type="submit"
          className={`${instrumentSans.className} ${styles.submitBtn}`}
        >
          Mettre à jour
        </button>

        {state?.message && (
          <p
            className={
              state.status === "success" ? styles.success : styles.error
            }
          >
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
