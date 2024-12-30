"use client";

import { usePathname } from "next/navigation";

export default function ProjectsDropdown({ projects }) {
  // Fetch the projects of the authentified user
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
            <span>{currentProject?.name}</span>
            {/* Dropdown */}
            <div></div>
          </div>
        </>
      )}
    </div>
  );
}
