"use client";
import styles from "@/styles/layouts/project-header.module.css";
import { useState, useRef, useEffect, useActionState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { updateProject } from "@/actions/project";
import {
  Archive,
  Globe,
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
import { icons, isNotEmpty } from "@/utils/utils";
import { useTranslation } from "react-i18next";

const initialState = {
  status: "pending",
  message: "",
  payload: null,
  errors: null,
};

export default function ProjectTitle({ project }) {
  const { t } = useTranslation();
  const router = useRouter();

  const updateProjectWithT = updateProject.bind(null, t);
  const [state, formAction, pending] = useActionState(
    updateProjectWithT,
    initialState
  );

  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project?.name);
  const [addTemplate, setAddTemplate] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const formRef = useRef(null);
  const inputRef = useRef(null);

  const isOwnerOrManager = useUserRole(project, ["owner", "manager"]);

  async function handleDeleteProject() {
    const response = await deleteProject(project?._id);

    if (response?.success) {
      router.push("/projects");
    }

    mutate(`/project/${project?._id}`);
    setIsMoreOpen(false);
  }

  function handleAddTemplate() {
    setAddTemplate((prev) => !prev);
    setIsMoreOpen(false);
  }

  const options = [
    {
      authorized: isOwnerOrManager,
      link: `/projects/${project?._id}/options`,
      icon: <Settings2 size={16} />,
      name: t("projects.project_options_menu"),
    },
    {
      link: `/projects/${project?._id}/archive`,
      icon: <Archive size={16} />,
      name: t("projects.project_archives"),
    },
    {
      authorized: isOwnerOrManager,
      function: handleAddTemplate,
      icon: <Save size={16} />,
      name: t("projects.save_project"),
    },
    {
      authorized: isOwnerOrManager,
      function: handleDeleteProject,
      icon: <Trash2 size={16} />,
      name: t("projects.delete_project_menu"),
      remove: true,
      project: true,
      deletionName: project?.name,
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

  function displayIcon(iconName) {
    const icon = icons.find((i) => i.name === iconName);
    return icon.icon || <Globe size={20} />;
  }

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
            <input
              type="text"
              name="note"
              id="note"
              defaultValue={project?.note}
              hidden
            />
            {project.urls.map((url) => (
              <div key={url?._id} hidden>
                <input
                  type="text"
                  name="url"
                  id={`url-${url?._id}`}
                  defaultValue={url?.url}
                  hidden
                />
                <input
                  type="text"
                  name="icon"
                  id={`icon-${url?._id}`}
                  defaultValue={url?.icon}
                  hidden
                />
              </div>
            ))}
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

      {isNotEmpty(project?.urls) && (
        <div className={styles.links}>
          {project?.urls?.map((url, idx) => {
            return (
              <div key={idx}>
                <a href={url?.url} target="_blank" rel="noopener noreferrer">
                  {displayIcon(url?.icon)}
                </a>
              </div>
            );
          })}
        </div>
      )}
      {addTemplate && (
        <AddTemplate project={project} setAddTemplate={setAddTemplate} />
      )}
    </div>
  );
}
