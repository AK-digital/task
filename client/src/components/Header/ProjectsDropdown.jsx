"use client";
import styles from "@/styles/components/header/projectsDropdown.module.css";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function ProjectsDropdown({ projects }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];

  // Find the current project
  const currentProject = projects?.find(
    (project) => projectId === project?._id
  );

  return (
    projects?.length > 0 && (
      <div className={styles["projects-dropdown"]}>
        <span>Sélectionner un projet</span>
        {/* current project */}
        <div className={styles["projects-dropdown__projects"]}>
          <div
            className={styles["projects-dropdown__button"]}
            data-open={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>
              {currentProject?.name} | <FontAwesomeIcon icon={faAngleDown} />
            </span>
          </div>
          {/* Dropdown */}
          {isOpen && (
            <div className={styles["projects-dropdown__list"]}>
              <ul>
                {projects.map((project) => (
                  <li
                    key={project?._id}
                    className={styles["projects-dropdown__item"]}
                  >
                    <Link href={`/project/${project?._id}`}>
                      {project?.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <span>OU</span>
      </div>
    )
  );
}
