"use client";
import styles from "@/styles/layouts/project-header.module.css";
import { useState, useRef, useEffect, useActionState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { updateProject } from "@/actions/project";
import {
  Archive,
  Figma,
  Github,
  Globe,
  Layout,
  MoreVertical,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import { useUserRole } from "@/app/hooks/useUserRole";
import { mutate } from "swr";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/api/project";
import AddTemplate from "../Templates/AddTemplate";
import { MoreMenu } from "../Dropdown/MoreMenu";

const initialState = {
  status: "pending",
  message: "",
  payload: null,
  errors: null,
};

export default function ProjectTitle({ project }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateProject,
    initialState
  );

  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project?.name);
  const [addTemplate, setAddTemplate] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const formRef = useRef(null);
  const inputRef = useRef(null);

  const isOwnerOrManager = useUserRole(project, ["owner", "manager"]);

  async function handleDeleteProject(e) {
    e.preventDefault();
    const isConfirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le projet "${project?.name}" ?`
    );

    if (!isConfirmed) return;

    const response = await deleteProject(project?._id);

    if (response?.success) {
      router.refresh();
      router.push("/projects");
    }

    mutate(`/project/${project?._id}`);
    setIsMoreOpen(false);
  }

  function handleAddTemplate(e) {
    e.preventDefault();

    setAddTemplate((prev) => !prev);
    setIsMoreOpen(false);
  }

  const options = [
    {
      authorized: isOwnerOrManager,
      link: `/projects/${project?._id}/options`,
      icon: <Settings2 size={16} />,
      name: "Options du projet",
    },
    {
      link: `/projects/${project?._id}/archive`,
      icon: <Archive size={16} />,
      name: "Archives du projet",
    },
    {
      authorized: isOwnerOrManager,
      function: handleAddTemplate,
      icon: <Save size={16} />,
      name: "Enregistrer le projet comme modèle",
    },
    {
      authorized: isOwnerOrManager,
      function: handleDeleteProject,
      icon: <Trash2 size={16} />,
      name: "Supprimer le projet",
      remove: true,
    },
  ];

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
    if (!isOwnerOrManager) return;

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

      <div className={styles.more}>
        <MoreVertical size={20} onClick={() => setIsMoreOpen(true)} />
        {isMoreOpen && (
          <MoreMenu
            isOpen={isMoreOpen}
            setIsOpen={setIsMoreOpen}
            options={options}
          />
        )}
      </div>

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
      {addTemplate && (
        <AddTemplate project={project} setAddTemplate={setAddTemplate} />
      )}
    </div>
  );
}
