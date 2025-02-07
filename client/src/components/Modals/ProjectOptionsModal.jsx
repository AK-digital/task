"use client";
import { useState, useRef, useEffect, useActionState } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { updateProject, updateProjectLogo } from "@/actions/project";
import styles from "@/styles/components/modals/project-options-modal.module.css";
import { X } from "lucide-react";
import { instrumentSans } from "@/utils/font";
import { deleteProject } from "@/api/project";
import { useRouter } from "next/navigation";
import PopupMessage from "@/layouts/PopupMessage";

export default function ProjectOptionsModal({ project, setOpenModal }) {
  const router = useRouter();

  async function handleDeleteProject() {
    const isConfirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project?.name}" ?`);

    if (!isConfirmed) return;

    const response = await deleteProject(project?._id);

    if (response?.success) {
      setOpenModal(false);
      router.refresh();
      router.push("/projects");
    }
  }

  return (
    <>
      <div className={styles.overlay}>
        <span
          className={styles.closeButton}
          onClick={() => setOpenModal(false)}
        >
          <X size={32} />
        </span>
        <h1>Options du projet {project?.name}</h1>
        <div className={styles.content}>
          <ProjectLogoForm project={project} />
          <ProjectOptionsForm project={project} />
          <button
            className={`${instrumentSans.className} ${styles.deleteBtn}`}
            onClick={handleDeleteProject}
          >
            Supprimer le projet
          </button>
        </div>
      </div>
      <div
        id="modal-layout"
        onClick={() => setOpenModal(false)}
        className={styles.layout}
      ></div>
    </>
  );
}

export function ProjectLogoForm({ project }) {
  const formRef = useRef(null);
  const [editImg, setEditImg] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupState, setPopupState] = useState({
    status: '',
    message: ''
  });

  const initialState = {
    status: "pending",
    message: "",
    errors: null,
  };

  const [state, formAction, pending] = useActionState(
    updateProjectLogo,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      setPopupState({
        status: "success",
        message: "Le logo a été mis à jour avec succès"
      });
      setShowPopup(true);
      setEditImg(false);
      setTimeout(() => setShowPopup(false), 3000);
    }
    if (state?.status === "failure") {
      setPopupState({
        status: "error",
        message: "Une erreur inattendue est survenue"
      });
      setShowPopup(true);
      setEditImg(false);
      setTimeout(() => setShowPopup(false), 3000);
    }
  }, [state]);

  function handleUpdateLogo() {
    setEditImg(true);
    formRef?.current?.requestSubmit();
  }

  return (
    <>
      <form action={formAction} ref={formRef}>
        <input type="hidden" name="project-id" defaultValue={project?._id} />
        <div className={styles.logoContainer}>
          <div
            className={styles.picture}
            onMouseEnter={() => setEditImg(true)}
            onMouseLeave={() => setEditImg(false)}
          >
            <Image
              src={project?.logo || project?.favicon || "/default-project-logo.webp"}
              alt="Logo du projet"
              width={120}
              height={120}
              quality={100}
              className={styles.projectLogo}
              onError={(e) => {
                // Si le favicon n'est pas accessible, on utilise le logo par défaut
                e.target.src = "/default-project-logo.webp";
              }}
            />
            {editImg && (
              <label htmlFor="logo" className={styles.editPicture}>
                {!pending && <Pencil size={20} />}
              </label>
            )}
            <input
              type="file"
              name="logo"
              id="logo"
              hidden
              onChange={handleUpdateLogo}
              accept="image/*"
              disabled={pending}
            />
          </div>
        </div>
      </form>

      {showPopup && (
        <PopupMessage
          status={popupState.status}
          title={popupState.status === "success" ? "Succès" : "Erreur"}
          message={popupState.message}
        />
      )}
    </>
  );
}

export function ProjectOptionsForm({ project, setStatusMessage, setStatus }) {
  const initialState = {
    status: "pending",
    message: "",
    errors: null,
  };

  const [state, formAction, pending] = useActionState(
    updateProject,
    initialState
  );
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (state?.status === "success") {
      setShowPopup(true);
      // Masquer le popup après 3 secondes
      setTimeout(() => setShowPopup(false), 3000);
    }
  }, [state]);

  return (
    <>
      <form className={styles.form} action={formAction}>
        <input type="hidden" name="project-id" defaultValue={project?._id} />
        <div className={styles.formGroup}>
          <label htmlFor="wpUrl">Nom du projet</label>
          <input
            type="text"
            id="project-name"
            name="project-name"
            placeholder="Täsk"
            className={`${instrumentSans.className} ${styles.input}`}
            defaultValue={project?.name}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="siteUrl">URL du site</label>
          <input
            type="url"
            id="url-wordpress"
            name="url-wordpress"
            placeholder="https://exemple.com"
            className={`${instrumentSans.className} ${styles.input}`}
            defaultValue={project?.settings?.urlWordpress}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="wpUrl">URL du backoffice WordPress</label>
          <input
            type="url"
            id="url-backoffice-wordpress"
            name="url-backoffice-wordpress"
            placeholder="https://exemple.com/wp-admin"
            className={`${instrumentSans.className} ${styles.input}`}
            defaultValue={project?.settings?.urlBackofficeWordpress}
          />
        </div>
        <button
          type="submit"
          className={`${instrumentSans.className} ${styles.submitBtn}`}
          data-disabled={pending}
          disabled={pending}
        >
          Enregistrer les modifications
        </button>
      </form>

      {showPopup && (
        <PopupMessage
          status="success"
          title="Succès"
          message="Les modifications ont été enregistrées avec succès"
        />
      )}
    </>
  );
}
