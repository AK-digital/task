"use client";
import styles from "@/styles/components/header/projectsDropdown.module.css";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function ProjectsDropdown({ projects }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];

  // Find the current project
  const currentProject = projects.find((project) => projectId === project?._id);

  console.log(currentProject);
  console.log(projects, "liste des projets");

  return (
    <div className={styles.container}>
      {projects?.length > 0 && (
        <>
          <span>Séléctionner un projet</span>
          {/* current project */}
          <div className={styles.projects}>
            <div className={styles.button} onClick={(e) => setIsOpen(!isOpen)}>
              <span>{currentProject?.name}</span>
            </div>
            {/* Dropdown */}
            {isOpen && (
              <div>
                <ul>
                  {projects.map((project) => {
                    return <li key={project?._id}>{project?.name}</li>;
                  })}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
