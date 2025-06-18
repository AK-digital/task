import Image from "next/image";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon, Undo } from "lucide-react";

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
        className="relative flex items-center justify-center gap-1 p-2.5 rounded border border-color-border-color bg-secondary cursor-pointer text-medium w-[180px] max-h-10"
      >
        {hasProjects ? (
          <>
            <span className="flex justify-center gap-1">
              {displayProjects?.visible?.map((project) => (
                <Image
                  src={project?.logo || "/default/default-project-logo.svg"}
                  width={24}
                  height={24}
                  alt={`Logo de ${project?.name}`}
                  key={project?._id}
                  className="rounded-full"
                />
              ))}
              {displayProjects?.remaining > 0 && (
                <span className="text-xs font-bold text-text-dark-color bg-primary rounded-full w-6 h-6 flex items-center justify-center">
                  +{displayProjects.remaining}
                </span>
              )}
            </span>
          </>
        ) : (
          <span className="flex justify-center gap-1 text-[15px]">
            Choisir un projet
          </span>
        )}
        {!isOpen && (
          <ChevronDownIcon size={16} className="absolute right-1.5" />
        )}
        {isOpen && <ChevronUpIcon size={16} className="absolute right-1.5" />}
      </div>
      <div
        className={`absolute top-[calc(100%+4px)] left-0 w-full bg-secondary shadow-medium rounded-lg z-[2000] overflow-hidden transition-all duration-[350ms] ease-in-out  ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="p-1.5 max-h-96 overflow-y-auto  [&>li]:hover:rounded-sm [&>li]:hover:shadow-small [&>li]:hover:bg-third">
          <li
            className="flex items-center gap-1 cursor-pointer p-1.5 text-xs"
            onClick={handleReset}
          >
            <Undo size={16} />
            Supprimer les filtres
          </li>
          {projects?.map((project) => (
            <li
              className="flex items-center gap-1 cursor-pointer p-1.5 text-xs"
              key={project?._id}
            >
              <input
                type="checkbox"
                id={`project-${project?._id}`}
                name="project"
                value={project?._id}
                onChange={(e) => handleProjectChange(e, project)}
                checked={isProjectSelected(project?._id)}
                className="max-w-4 max-h-4 cursor-pointer"
              />
              <label
                htmlFor={`project-${project?._id}`}
                className="flex items-center gap-1 cursor-pointer"
              >
                <Image
                  src={project?.logo || "/default/default-project-logo.svg"}
                  width={22}
                  height={22}
                  alt={`Logo de ${project?.name}`}
                  className="rounded-full"
                />
                <span className="block text-ellipsis overflow-hidden whitespace-nowrap max-w-25">
                  {project?.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
