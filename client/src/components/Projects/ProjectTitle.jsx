"use client";
import styles from "@/styles/layouts/project-header.module.css";
import { useState, useRef, useEffect, useContext, useActionState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { MoreHorizontal, Globe, Layout } from "lucide-react";
import ProjectOptionsModal from "@/components/Modals/ProjectOptionsModal";
import { AuthContext } from "@/context/auth";
import { updateProject } from "@/actions/project";

const initialState = {
  status: "pending",
  message: "",
  payload: null,
  errors: null,
};

export default function ProjectTitle({ project }) {
  const { uid } = useContext(AuthContext);
  const [state, formAction, pending] = useActionState(
    updateProject,
    initialState
  );
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project?.name);
  const [modalOpen, setModalOpen] = useState(false);
  const formRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedUpdate = useDebouncedCallback(async (newName) => {
    if (newName !== project?.name) {
      formRef?.current?.requestSubmit();
    }
  }, 600);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (state?.status === "failure") {
      setProjectName(project?.name);
    }
  }, [state]);

  const handleClick = () => {
    if (project?.author?._id === uid) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      formRef?.current?.requestSubmit();
      setIsEditing(false);
      e.target.blur();
    }
    if (e.key === "Escape") {
      setProjectName(project?.name);
      setIsEditing(false);
    }
  };

  const handleChange = (e) => {
    const newName = e.target.value;
    setProjectName(newName);
    debouncedUpdate(newName);
  };

  return (
    <div className={styles.titleContainer}>
      <div className={styles.title}>
        {isEditing ? (
          <form action={formAction} ref={formRef}>
            <input
              type="text"
              name="project-id"
              id="project-id"
              defaultValue={project?._id}
              hidden
            />
            <input
              ref={inputRef}
              type="text"
              id="project-name"
              name="project-name"
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              defaultValue={projectName}
              className={styles.titleInput}
            />
          </form>
        ) : (
          <span onClick={handleClick}>{projectName}</span>
        )}
      </div>
      {modalOpen && (
        <ProjectOptionsModal project={project} setOpenModal={setModalOpen} />
      )}
      <div className={styles.actions}>
        {project?.settings?.urlWordpress && (
          <a
            href={project.settings.urlWordpress}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkIcon}
            title="Voir le site"
          >
            <Globe size={20} />
          </a>
        )}
        {project?.settings?.urlBackofficeWordpress && (
          <a
            href={project.settings.urlBackofficeWordpress}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkIcon}
            title="Accéder au backoffice"
          >
            <Layout size={20} />
          </a>
        )}
        {/* Ajout du séparateur vertical */}
        {(project?.settings?.urlWordpress || project?.settings?.urlBackofficeWordpress) && project?.author?._id === uid && (
          <div className={styles.separator}></div>
        )}
        {project?.author?._id === uid && (
          <div className={styles.optionsBtn} onClick={() => setModalOpen(true)}>
            <MoreHorizontal />
          </div>
        )}
      </div>
    </div>
  );
}
