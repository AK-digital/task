"use client";
import styles from "@/styles/layouts/project-header.module.css";
import { useState, useRef, useEffect, useContext, useActionState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { MoreHorizontal } from "lucide-react";
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
  const inputRef = useRef(null);

  const debouncedUpdate = useDebouncedCallback(async (newName) => {
    if (project?._id && newName !== project?.name) {
      const response = await updateProjectName(project._id, newName);
      if (!response.success) {
        setProjectName(project?.name);
      }
    }
  }, 600);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setProjectName(project?.name);
  }, [project]);

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
          <form action={formAction}>
            <input
              ref={inputRef}
              type="text"
              id="name"
              name="name"
              value={projectName}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={styles.titleInput}
            />
          </form>
        ) : (
          <span onClick={handleClick}>{projectName}</span>
        )}
      </div>
      {project?.author?._id === uid && (
        <div className={styles.optionsBtn} onClick={() => setModalOpen(true)}>
          <MoreHorizontal />
        </div>
      )}
      {modalOpen && (
        <ProjectOptionsModal
          projectId={project._id}
          setOpenModal={setModalOpen}
        />
      )}
    </div>
  );
}
