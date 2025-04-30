"use client";
import styles from "@/styles/components/profile/profile-form.module.css";
import {
  useActionState,
  useContext,
  useEffect,
  useState,
  startTransition,
} from "react";
import { updateUserProfile, deleteUserProfile } from "@/actions/user";
import { bricolageGrostesque } from "@/utils/font";
import { mutate } from "swr";
import { AuthContext } from "@/context/auth";
import PopupMessage from "@/layouts/PopupMessage";
import ConfirmationDelete from "@/components/Popups/ConfirmationDelete";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProfileForm() {
  const { user } = useContext(AuthContext);

  const [updateState, updateFormAction, updatePending] = useActionState(
    async (prevState, formData) => {
      const res = await updateUserProfile(formData);
      return { ...res };
    },
    initialState
  );

  const [deleteState, deleteFormAction, deletePending] = useActionState(
    async (prevState, formData) => {
      const res = await deleteUserProfile(formData);
      return { ...res };
    },
    initialState
  );

  const [popUp, setPopup] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [lastName, setLastName] = useState(user?.lastName || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [company, setCompany] = useState(user?.company || "");
  const [position, setPosition] = useState(user?.position || "");

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    startTransition(() => {
      updateFormAction(formData);
    });
  };

  const handleDeleteConfirm = () => {
    const formData = new FormData();
    formData.append("userId", user?._id);
    startTransition(() => {
      deleteFormAction(formData);
    });
    setShowDeleteConfirmation(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  useEffect(() => {
    if (!updateState) return;

    if (updateState.status === "success") {
      mutate("/auth/session");
      setPopup({
        status: "success",
        title: "Profil mis à jour",
        message:
          updateState.message || "Vos informations ont été mises à jour.",
      });
    } else if (updateState.status === "failure") {
      setPopup({
        status: "error",
        title: "Erreur",
        message: updateState.message || "Une erreur est survenue.",
      });
    }

    const timeout = setTimeout(() => setPopup(null), 4000);
    return () => clearTimeout(timeout);
  }, [updateState]);

  useEffect(() => {
    if (!deleteState) return;

    if (deleteState.status === "success") {
      setPopup({
        status: "success",
        title: "Compte supprimé",
        message: deleteState.message || "Votre compte a été supprimé.",
      });
    } else if (deleteState.status === "failure") {
      setPopup({
        status: "error",
        title: "Erreur",
        message:
          deleteState.message ||
          "Une erreur est survenue lors de la suppression.",
      });
    }

    const timeout = setTimeout(() => setPopup(null), 4000);
    return () => clearTimeout(timeout);
  }, [deleteState]);

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
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="userId" defaultValue={user?._id} />

        <div className="form-group">
          <label htmlFor="firstName" data-active={firstName ? true : false}>
            Prénom
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            defaultValue={firstName}
            className={`${bricolageGrostesque.className} ${styles.input}`}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {updateState?.errors?.firstName && (
            <span className={styles.error}>{updateState.errors.firstName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" data-active={lastName ? true : false}>
            Nom
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            defaultValue={lastName}
            className={`${bricolageGrostesque.className} ${styles.input}`}
            onChange={(e) => setLastName(e.target.value)}
          />
          {updateState?.errors?.lastName && (
            <span className={styles.error}>{updateState.errors.lastName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="company" data-active={company ? true : false}>
            Entreprise
          </label>
          <input
            type="text"
            id="company"
            name="company"
            defaultValue={company}
            className={`${bricolageGrostesque.className} ${styles.input}`}
            onChange={(e) => setCompany(e.target.value)}
          />
          {updateState?.errors?.company && (
            <span className={styles.error}>{updateState.errors.company}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="position" data-active={position ? true : false}>
            Poste
          </label>
          <input
            type="text"
            id="position"
            name="position"
            defaultValue={position}
            className={`${bricolageGrostesque.className} ${styles.input}`}
            onChange={(e) => setPosition(e.target.value)}
          />
          {updateState?.errors?.position && (
            <span className={styles.error}>{updateState.errors.position}</span>
          )}
        </div>

        <div className={styles.btnContainer}>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => setShowDeleteConfirmation(true)}
            disabled={deletePending}
          >
            Supprimer le compte
          </button>
          <button
            type="submit"
            className={`${bricolageGrostesque.className} ${styles.submitBtn}`}
            disabled={updatePending}
          >
            Mettre à jour
          </button>
        </div>
      </form>

      {showDeleteConfirmation && (
        <ConfirmationDelete
          title="compte"
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {popUp && (
        <div className={styles.confirmPopup}>
          <PopupMessage
            status={popUp.status}
            title={popUp.title}
            message={popUp.message}
          />
        </div>
      )}
    </>
  );
}
