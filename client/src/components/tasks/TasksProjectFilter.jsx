import { useProjects } from "@/app/hooks/useProjects";
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
    <div className="relative">
      <div
        className={`flex items-center gap-2 bg-background-secondary-color p-2.5 rounded-sm border border-color-border-color cursor-pointer w-[195px] transition-all duration-[120ms] ease-in-out hover:bg-[#f9f7efb3] hover:shadow-shadow-box-small ${
          isOpen ? "bg-[#f9f7efb3] shadow-shadow-box-small" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
        data-open={isOpen}
      >
        {theProject ? (
          <Image
            src={theProject?.logo || "/default-project-logo.webp"}
            width={18}
            height={18}
            quality={100}
            alt={`Logo de ${theProject?.name}`}
            className="rounded-full"
          />
        ) : (
          <FolderOpenDot size={16} />
        )}
        <span className="max-w-[140px] flex-1 whitespace-nowrap text-ellipsis overflow-hidden block">
          {theProject?.name || "Choisir un projet"}
        </span>
        <ChevronDown 
          size={16} 
          className={`transition-all duration-[120ms] ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isOpen && (
        <div className="absolute top-11 rounded-sm bg-white shadow-shadow-box-small border border-color-border-color p-2 w-full z-[9991]">
          {isNotEmpty(projects) ? (
            <ul>
              <li 
                className="flex items-center gap-1 p-1.5 cursor-pointer text-small font-medium transition-all duration-[120ms] ease-in-out hover:bg-background-third-color hover:shadow-shadow-box-small hover:rounded-sm" 
                onClick={() => handleSelectProject()}
              >
                <Undo size={16} />
                Supprimer les filtres
              </li>
              {projects.map((project) => (
                <li
                  key={project._id}
                  className="flex items-center gap-1 p-1.5 cursor-pointer text-small font-medium transition-all duration-[120ms] ease-in-out hover:bg-background-third-color hover:shadow-shadow-box-small hover:rounded-sm"
                  onClick={() => handleSelectProject(project._id)}
                >
                  <Image
                    src={project?.logo || "/default-project-logo.webp"}
                    width={24}
                    height={24}
                    alt={`Logo de ${project?.name}`}
                    className="rounded-full"
                  />
                  <span className="whitespace-nowrap text-ellipsis overflow-hidden block">
                    {project?.name}
                  </span>
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
