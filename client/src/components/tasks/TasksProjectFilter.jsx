import { useProjects } from "../../../hooks/useProjects";
import { isNotEmpty } from "@/utils/utils";
import { ChevronDown, FolderOpenDot, Undo } from "lucide-react";
import Image from "next/image";
import React, { useState, useCallback, useMemo } from "react";

export default function TasksProjectFilter({ queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const { projects } = useProjects();

  // Mémoriser le projet sélectionné pour éviter les recherches répétées
  const theProject = useMemo(() => {
    return projects?.find((project) => project._id === queries?.projectId);
  }, [projects, queries?.projectId]);

  // Mémoriser la fonction de toggle pour éviter les re-renders
  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Optimiser la fonction de sélection de projet
  const handleSelectProject = useCallback(
    (projectId) => {
      setIsOpen(false);

      setQueries((prevQueries) => ({
        ...prevQueries,
        projectId: projectId || null,
      }));
    },
    [setQueries]
  );

  // Mémoriser la fonction de reset pour éviter les re-renders
  const handleResetProject = useCallback(() => {
    handleSelectProject(null);
  }, [handleSelectProject]);

  // Mémoriser la liste des projets pour éviter les map répétés
  const projectsList = useMemo(() => {
    if (!isNotEmpty(projects)) return null;

    return projects.map((project) => (
      <li
        key={project._id}
        className="flex items-center gap-1 p-1.5 cursor-pointer text-small font-medium transition-all duration-[120ms] ease-in-out hover:bg-third hover:shadow-small hover:rounded-sm"
        onClick={() => handleSelectProject(project._id)}
      >
        <Image
          src={project?.logo || "/default-project-logo.webp"}
          width={24}
          height={24}
          alt={`Logo de ${project?.name}`}
          className="rounded-full"
          priority={false}
          loading="lazy"
        />
        <span className="whitespace-nowrap text-ellipsis overflow-hidden block">
          {project?.name}
        </span>
      </li>
    ));
  }, [projects, handleSelectProject]);

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 bg-secondary p-2.5 rounded-sm border border-color-border-color cursor-pointer w-[195px] transition-all duration-[120ms] ease-in-out hover:bg-[#f9f7efb3] hover:shadow-small ${
          isOpen ? "bg-[#f9f7efb3] shadow-small" : ""
        }`}
        onClick={toggleDropdown}
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
            priority={false}
            loading="lazy"
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
      <div
        className={`absolute top-11 rounded-sm bg-white shadow-small w-full z-[9991] overflow-hidden transition-all duration-[200ms] ease-in-out ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        {isNotEmpty(projects) ? (
          <ul className="p-2 max-h-96 overflow-y-auto border border-color-border-color">
            <li
              className="flex items-center gap-1 p-1.5 cursor-pointer text-small font-medium transition-all duration-[120ms] ease-in-out hover:bg-third hover:shadow-small hover:rounded-sm"
              onClick={handleResetProject}
            >
              <Undo size={16} />
              Supprimer les filtres
            </li>
            {projectsList}
          </ul>
        ) : (
          <span className="p-2 text-small">Aucun projet n'a été trouvé</span>
        )}
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="modal-layout-opacity"
        ></div>
      )}
    </div>
  );
}
