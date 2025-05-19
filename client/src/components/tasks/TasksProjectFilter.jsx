import { useProjects } from "@/app/hooks/useProjects";
import styles from "@/styles/components/tasks/tasks-select-project.module.css";
import { isNotEmpty } from "@/utils/utils";
import { ChevronDown, FolderOpenDot, Undo } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export default function TasksProjectFilter({ queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const { projects } = useProjects();

  // We need to get the project name from the id stored in the selectedProject state
  const theProject = projects?.find(
    (project) => project._id === queries?.projectId
  );

  function handleSelectProject(projectId) {
    setIsOpen(false);

    if (!projectId) {
      setQueries((prevQueries) => ({
        ...prevQueries,
        projectId: null,
      }));
    }

    if (projectId) {
      setQueries((prevQueries) => ({
        ...prevQueries,
        projectId: projectId,
      }));
    }
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.current}
        onClick={() => setIsOpen(!isOpen)}
        data-open={isOpen}
      >
        {theProject?.logo ? (
          <Image
            src={theProject?.logo}
            width={18}
            height={18}
            quality={100}
            alt={`Logo de ${theProject?.name}`}
          />
        ) : (
          <FolderOpenDot size={16} />
        )}
        <span>{theProject?.name || "Choisir un projet"} </span>
        <ChevronDown size={16} />
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          {isNotEmpty(projects) ? (
            <ul>
              <li className={styles.item} onClick={() => handleSelectProject()}>
                <Undo size={16} />
                Supprimer les filtres
              </li>
              {projects.map((project) => (
                <li
                  key={project._id}
                  className={styles.item}
                  onClick={() => handleSelectProject(project._id)}
                >
                  <Image
                    src={project?.logo || "/default-project-logo.webp"}
                    width={24}
                    height={24}
                    alt={`Logo de ${project?.name}`}
                  />
                  <span>{project?.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span>Aucun projet n'a été trouvé</span>
          )}
        </div>
      )}
    </div>
  );
}
