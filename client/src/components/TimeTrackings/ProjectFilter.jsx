import Image from "next/image";
import React, { useState } from "react";
import styles from "@/styles/components/timeTrackings/projectFilter.module.css";
import { ChevronDownIcon } from "lucide-react";

export default function ProjectFilter({ projects, queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentProjects, setCurrentProjects] = useState(
    projects?.filter((p) => queries?.projects?.includes(p?.name)) || []
  );
  const hasProjects = currentProjects?.length > 0;

  function handleProjectChange(e, project) {
    const isChecked = e.target.checked;
    const projectName = e.target.value;

    if (isChecked) {
      const newCurrentProjects = [...currentProjects, project];
      setCurrentProjects(newCurrentProjects);

      const newProjectNames = newCurrentProjects.map((p) => p.name);

      setQueries({ ...queries, projects: newProjectNames });
    } else {
      const newCurrentProjects = currentProjects.filter(
        (p) => p?.name !== projectName
      );

      setCurrentProjects(newCurrentProjects);

      const newProjectNames = newCurrentProjects.map((p) => p.name);
      setQueries({ ...queries, projects: newProjectNames });
    }
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
            {projects?.map((project) => {
              return (
                <li className={styles.project} key={project?._id}>
                  <input
                    type="checkbox"
                    id={`project-${project?._id}`}
                    name="project"
                    value={project?.name}
                    onChange={(e) => handleProjectChange(e, project)}
                    checked={queries?.projects?.includes(project?.name)}
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
