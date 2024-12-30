"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

export default function ProjectsDropdown({ projects }) {
  // Fetch the projects of the authentified user
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];

  const currentProject = projects.find((project) => projectId === project?._id);

  console.log(currentProject);

  return (
    <div>
      {projects?.length > 0 && (
        <>
          <span>Séléctionner un projet</span>

          {/* current project */}
          <div>
            <span onClick={(e) => setIsOpen(!isOpen)}>
              {currentProject?.name}
            </span>
            {/* Dropdown */}
            {isOpen && (
              <div>
                <ul>
                  {projects.map((project) => {
                    return <li>{project?.name}</li>;
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
