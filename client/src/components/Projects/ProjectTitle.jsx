"use client";
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
import socket from "@/utils/socket";

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

  async function handleDeleteProject() {
    socket.emit("redirect-project", project?._id);
    socket.emit("update-project", null, project?._id);

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
      socket.emit("update-project", null, project?._id);
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
    <div className="flex flex-row items-center gap-4">
      <div className="flex items-center font-bold text-large">
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
              className="bg-none border-none text-inherit text-[length:inherit] font-[family:inherit] py-0.5 px-1 rounded-sm w-75 focus:outline-none"
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
          <span
            onClick={handleIsEditing}
            className="cursor-pointer w-max hover:opacity-80"
          >
            {projectName}
          </span>
        )}
      </div>

      <div className="relative top-0.5 cursor-pointer transition-[background-color] duration-200 rounded-lg">
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
        <div className="flex items-center gap-3 [&_svg]:w-[22px] [&_svg]:h-[22px]">
          {project?.urls?.map((url, idx) => {
            return (
              <div key={idx}>
                <a
                  href={url?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-secondary p-2 rounded-lg"
                >
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
