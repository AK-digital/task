import Image from "next/image";
import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, Undo } from "lucide-react";

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
    <div className="relative select-none">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center gap-1 p-2.5 rounded border border-color-border-color bg-secondary cursor-pointer text-medium w-[180px] max-h-10"
      >
        {hasProjects ? (
          <>
            <span className="flex justify-center gap-1">
              {currentProjects?.slice(0, 3)?.map((project) => {
                return (
                  <Image
                    src={project?.logo || "/default-project-logo.svg"}
                    width={24}
                    height={24}
                    alt={`Logo de ${project?.name}`}
                    key={project?._id}
                    className="rounded-full"
                  />
                );
              })}
              {currentProjects?.length > 3 && (
                <span className="text-xs font-bold text-text-dark-color bg-primary rounded-full w-6 h-6 flex items-center justify-center">
                  +{currentProjects?.length - 3}
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
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-secondary shadow-medium rounded-lg p-1.5 z-[2000] max-h-[300px] overflow-y-auto">
          <ul className="[&>li]:hover:rounded-sm [&>li]:hover:shadow-small [&>li]:hover:bg-third">
            <li
              className="flex items-center gap-1 cursor-pointer p-1.5 text-xs"
              onClick={handleReset}
            >
              <Undo size={16} />
              Supprimer les filtres
            </li>
            {projects?.map((project) => {
              return (
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
                    checked={Boolean(queries?.projects?.includes(project?._id))}
                    className="max-w-4 max-h-4 cursor-pointer"
                  />
                  <label
                    htmlFor={`project-${project?._id}`}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <Image
                      src={project?.logo || "/default-project-logo.svg"}
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
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
