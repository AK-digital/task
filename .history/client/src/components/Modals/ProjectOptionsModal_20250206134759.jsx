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

export default function ProjectOptionsModal({ project, setOpenModal }) {
  const [statusMessage, setStatusMessage] = useState();
  const [status, setStatus] = useState("");
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
          <ProjectLogoForm
            project={project}
            setStatusMessage={setStatusMessage}
            setStatus={setStatus}
          />
          {/* Project Options Form */}
          <ProjectOptionsForm
            project={project}
            setStatusMessage={setStatusMessage}
            setStatus={setStatus}
          />
          {statusMessage && (
            <div className={styles.statusMessage}>
              <span data-status={status}>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>
      <div
        id="modal-layout-opacity"
        onClick={() => setOpenModal(false)}
        className={styles.layout}
      ></div>
    </>
  );
}

export function ProjectLogoForm({ project, setStatusMessage, setStatus }) {
  const formRef = useRef(null);
  const [editImg, setEditImg] = useState(false);
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
    setStatusMessage("");
    setStatus("");
    if (state?.status === "success") {
      setStatusMessage("Les modifications ont été enregistrées avec succès.");
      setStatus("success");
      setEditImg(false);
    }
    if (state?.status === "failure") {
      setStatusMessage("Une erreur innatendu est survenue");
      setStatus("failure");
      setEditImg(false);
    }
  }, [state]);

  function handleUpdateLogo() {
    setEditImg(true);
    formRef?.current?.requestSubmit();
  }

  return (
    <form action={formAction} ref={formRef}>
      <input type="hidden" name="project-id" defaultValue={project?._id} />
      <div className={styles.logoContainer}>
        <div
          className={styles.picture}
          onMouseEnter={() => setEditImg(true)}
          onMouseLeave={() => setEditImg(false)}
        >
          <Image
            src={project?.logo || "/default-project-logo.webp"}
            alt="Logo du projet"
            width={120}
            height={120}
            quality={100}
            className={styles.projectLogo}
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

  useEffect(() => {
    setStatusMessage("");
    if (state?.status === "success") {
      setStatusMessage("Les modifications ont été enregistrées avec succès.");
      setStatus("success");
    }
    if (state?.status === "failure") {
      setStatusMessage("Une erreur innatendu est survenue");
      setStatus("failure");
    }
  }, [state]);

  console.log(state);

  return (
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
  );
}
