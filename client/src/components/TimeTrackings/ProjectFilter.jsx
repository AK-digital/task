import Image from "next/image";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ChevronDown, FolderOpen, Undo } from "lucide-react";
import Checkbox from "../UI/Checkbox";

export default function ProjectFilter({ projects, queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculer les projets actuels basés sur queries.projects au lieu d'un état séparé
  const currentProjects = useMemo(() => {
    if (!queries?.projects?.length || !projects?.length) return [];

    return projects.filter((project) => queries.projects.includes(project._id));
  }, [queries?.projects, projects]);

  const hasProjects = currentProjects?.length > 0;

  // Mémoriser les projets visibles (premiers 3 + compteur)
  const displayProjects = useMemo(() => {
    if (!hasProjects) return null;

    const visibleProjects = currentProjects.slice(0, 3);
    const remainingCount = currentProjects.length - 3;

    return {
      visible: visibleProjects,
      remaining: remainingCount > 0 ? remainingCount : 0,
    };
  }, [currentProjects, hasProjects]);

  // Optimiser la fonction de changement de projet
  const handleProjectChange = useCallback(
    (e, project) => {
      const isChecked = e.target.checked;
      const projectId = project._id;

      setQueries((prev) => {
        const currentProjectIds = prev?.projects || [];

        if (isChecked) {
          // Ajouter le projet s'il n'est pas déjà présent
          if (!currentProjectIds.includes(projectId)) {
            return { ...prev, projects: [...currentProjectIds, projectId] };
          }
          return prev;
        } else {
          // Retirer le projet
          const newProjectIds = currentProjectIds.filter(
            (id) => id !== projectId
          );
          return {
            ...prev,
            projects: newProjectIds.length > 0 ? newProjectIds : undefined,
          };
        }
      });
    },
    [setQueries]
  );

  // Mémoriser la fonction de reset
  const handleReset = useCallback(() => {
    setQueries((prev) => ({ ...prev, projects: undefined }));
  }, [setQueries]);

  // Mémoriser la fonction de toggle du dropdown
  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Mémoriser la vérification si un projet est sélectionné
  const isProjectSelected = useCallback(
    (projectId) => {
      return Boolean(queries?.projects?.includes(projectId));
    },
    [queries?.projects]
  );

  return (
    <div className="relative select-none">
      <div
        onClick={toggleDropdown}
        className="secondary-button min-w-[180px]"
        data-open={isOpen}
      >
        <FolderOpen size={16} />
        <span className="flex-1 text-[14px]">
          {hasProjects ? "Projets sélectionnés" : "Projets"}
        </span>
        {hasProjects && (
          <span className="absolute -right-1 -top-1 flex items-center justify-center text-white w-[18px] h-[18px] rounded-full bg-accent-color text-small">
            {currentProjects?.length}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`transition-all duration-[200ms] ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      <div
        className={`absolute z-[2001] top-[44px] shadow-small w-full font-medium text-small overflow-hidden transition-all duration-[350ms] ease-in-out min-w-[180px] ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        {isOpen && (
          <ul className="flex flex-col pl-2 pt-2 pr-4 pb-4 border border-[#e0e0e0] bg-secondary  rounded-sm max-h-96 overflow-y-auto">
            <li
              className="flex items-center gap-2 h-[30px] pl-1 py-0.5 cursor-pointer text-xs hover:bg-third hover:shadow-small hover:rounded-sm"
              onClick={handleReset}
            >
              <Undo size={14} />
              <span>Effacer</span>
            </li>
            {projects?.map((project) => (
              <li
                key={project?._id}
                className="flex items-center gap-2 h-[30px] pl-1 py-0.5 cursor-pointer hover:bg-third text-xs hover:shadow-small hover:rounded-sm"
              >
                <Checkbox
                  id={`project-${project?._id}`}
                  name="project"
                  value={project?._id}
                  onChange={(e) => handleProjectChange(e, project)}
                  checked={isProjectSelected(project?._id)}
                />
                <label
                  htmlFor={`project-${project?._id}`}
                  className="flex items-center gap-1 cursor-pointer flex-1"
                >
                  <Image
                    src={project?.logo || "/default/default-project-logo.svg"}
                    width={22}
                    height={22}
                    alt={`Logo de ${project?.name}`}
                    className="rounded-full"
                  />
                  <span className="block text-ellipsis overflow-hidden whitespace-nowrap max-w-[12ch]">
                    {project?.name}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
