"use client";
import {
  useState,
  useRef,
  useEffect,
  useTransition,
  useActionState,
} from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { updateProject, updateProjectLogo } from "@/actions/project";
import styles from "@/styles/components/modals/project-options-modal.module.css";
import { X } from "lucide-react";
import { instrumentSans } from "@/utils/font";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProjectOptionsModal({ projectId, setOpenModal }) {
  const [statusMessage, setStatusMessage] = useState();
  return (
    <>
      <div className={styles.overlay}>
        <span
          className={styles.closeButton}
          onClick={() => setOpenModal(false)}
        >
          <X size={32} />
        </span>
        <h2>Options du projet</h2>
        <div className={styles.content}>
          <form action={formAction} ref={formRef}>
            <input type="hidden" name="projectId" defaultValue={projectId} />
            <div className={styles.logoContainer}>
              <div
                className={styles.picture}
                onMouseEnter={() => setEditImg(true)}
                onMouseLeave={() => setEditImg(false)}
              >
                <Image
                  src={
                    previewUrl ||
                    state.data?.logo ||
                    "/default-project-logo.webp"
                  }
                  alt="Logo du projet"
                  width={120}
                  height={120}
                  quality={100}
                  className={styles.projectLogo}
                />
                {editImg && !pending && (
                  <label htmlFor="logo" className={styles.editPicture}>
                    <Pencil size={20} />
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

          {/* Project Options Form */}
        </div>
      </div>
      <div id="modal-layout-opacity" onClick={() => setOpenModal(false)}></div>
    </>
  );
}

export function ProjectOptionsForm({ project, setStatusMessage }) {
  const initialState = {
    status: "pending",
    message: "",
    errors: null,
  };

  const [state, formAction, pending] = useActionState(
    updateProject,
    initialState
  );

  useEffect(() => {
    setStatusMessage("");
    if (state?.status === "success") {
      setStatusMessage("Les modifications ont été enregistrées avec succès.");
    }
    if (state?.status === "failure") {
      setStatusMessage("Une erreur innatendu est survenue");
    }
  }, [state]);

  return (
    <form className={styles.form} action={formAction}>
      <div className={styles.formGroup}>
        <label htmlFor="siteUrl">URL du site</label>
        <input
          type="url"
          id="siteUrl"
          name="siteUrl"
          placeholder="https://exemple.com"
          className={`${instrumentSans.className} ${styles.input}`}
          defaultValue={project?.settings?.urlWordpress}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="wpUrl">URL du backoffice WordPress</label>
        <input
          type="url"
          id="wpUrl"
          name="wpUrl"
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
  );
}
