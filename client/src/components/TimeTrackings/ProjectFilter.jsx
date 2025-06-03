import Image from "next/image";
import React, { useState } from "react";
import styles from "@/styles/components/timeTrackings/projectFilter.module.css";
import { ChevronDownIcon, Undo } from "lucide-react";

export default function ProjectFilter({ projects, queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentProjects, setCurrentProjects] = useState([]);
  const hasProjects = currentProjects?.length > 0;

  function handleProjectChange(e, project) {
    const isChecked = e.target.checked;
    const projectId = project?._id;

    if (isChecked) {
      const newCurrentProjects = [...currentProjects, project];
      setCurrentProjects(newCurrentProjects);

      const newProjectIds = newCurrentProjects.map((p) => p?._id);

      setQueries({ ...queries, projects: newProjectIds });
    } else {
      const newCurrentProjects = currentProjects.filter(
        (p) => p?._id !== projectId
      );

      setCurrentProjects(newCurrentProjects);

      const newProjectIds = newCurrentProjects.map((p) => p._id);
      setQueries({ ...queries, projects: newProjectIds });
    }
  }

  function handleReset() {
    setCurrentProjects([]);
    setQueries({ ...queries, projects: undefined });
  }

  return (
    <div className={styles.container}>
      <div onClick={() => setIsOpen(!isOpen)} className={styles.current}>
        {hasProjects ? (
          <>
            <span>
              {currentProjects?.map((project) => {
                return (
                  <Image
                    src={project?.logo || "/default-project-logo.svg"}
                    width={24}
                    height={24}
                    alt={`Logo de ${project?.name}`}
                    key={project?._id}
                  />
                );
              })}
            </span>
          </>
        ) : (
          <span>Choisir un projet</span>
        )}
        <ChevronDownIcon size={16} className={styles.icon} />
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          <ul className={styles.projects}>
            <li className={styles.project} onClick={handleReset}>
              <Undo size={16} />
              Supprimer les filtres
            </li>
            {projects?.map((project) => {
              return (
                <li className={styles.project} key={project?._id}>
                  <input
                    type="checkbox"
                    id={`project-${project?._id}`}
                    name="project"
                    value={project?._id}
                    onChange={(e) => handleProjectChange(e, project)}
                    checked={Boolean(queries?.projects?.includes(project?._id))}
                  />
                  <label htmlFor={`project-${project?._id}`}>
                    <Image
                      src={project?.logo || "/default-project-logo.svg"}
                      width={22}
                      height={22}
                      alt={`Logo de ${project?.name}`}
                    />
                    <span>{project?.name}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
