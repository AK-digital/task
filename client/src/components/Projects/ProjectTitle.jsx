"use client";
import styles from "@/styles/layouts/project-header.module.css";
import { useState, useRef, useEffect, useContext, useActionState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { AuthContext } from "@/context/auth";
import { updateProject } from "@/actions/project";
import Link from "next/link";
import { Figma, Github, Globe, Layout, MoreVertical } from "lucide-react";
import { useUserRole } from "@/app/hooks/useUserRole";
import { mutate } from "swr";

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

  const canEdit = useUserRole(project, ["owner", "manager"]);

  const debouncedUpdate = useDebouncedCallback(async (newName) => {
    if (newName !== project?.name) {
      formRef?.current?.requestSubmit();
    }
  }, 600);

  useEffect(() => {
    setProjectName(project?.name);
  }, [project?.name]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (state?.status === "success") {
      mutate(`/project/${project?._id}`);
      setIsEditing(false);
    }
    if (state?.status === "failure") {
      setProjectName(project?.name);
    }
  }, [state]);

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

  const handleIsEditing = (e) => {
    if (!canEdit) return;

    setIsEditing((prev) => !prev);
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
              onBlur={handleIsEditing}
              onKeyDown={handleKeyDown}
              defaultValue={projectName}
              className={styles.titleInput}
            />
          </form>
        ) : (
          <span onClick={handleIsEditing}>{projectName}</span>
        )}
      </div>

      {canEdit && (
        <div className={styles.optionsBtn}>
          <Link href={`/projects/${project?._id}/options`}>
            <MoreVertical size={20} />
          </Link>
        </div>
      )}
      {/* Ajout du séparateur vertical */}
      {/* {project?.urls > 0 && <div className={styles.separator}></div>} */}

      <div className={styles.actions}>
        {project?.urls?.website && (
          <a
            href={project?.urls.website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkIcon}
            title="Voir le site"
          >
            <Globe size={20} />
          </a>
        )}
        {project?.urls?.admin && (
          <a
            href={project?.urls?.admin}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkIcon}
            title="Voir le site"
          >
            <Layout size={20} />
          </a>
        )}
        {project?.urls?.figma && (
          <a
            href={project?.urls?.figma}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkIcon}
            title="Voir le site"
          >
            <Figma size={20} />
          </a>
        )}
        {project?.urls?.github && (
          <a
            href={project?.urls?.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkIcon}
            title="Voir le site"
          >
            <Github size={20} />
          </a>
        )}
      </div>
      {modalOpen && (
        <ProjectOptionsModal
          project={project}
          setOpenModal={setModalOpen}
          uid={uid}
        />
      )}
    </div>
  );
}
