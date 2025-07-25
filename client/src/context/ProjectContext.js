"use client";
import { useBoards } from "../../hooks/useBoards";
import {
  usePriorities,
  usePrioritiesByProjects,
} from "../../hooks/usePriorities";
import { useProject } from "../../hooks/useProject";
import { useProjectsStatus } from "../../hooks/useProjectsStatus";
import { useStatuses, useStatusesByProjects } from "../../hooks/useStatus";
import { useTasks } from "../../hooks/useTasks";
import { createContext, useContext, useState } from "react";

const ProjectContext = createContext(null);

export function ProjectProvider({
  children,
  initialProject,
  initialBoards,
  initialTasks,
  initialStatuses,
  initialPriorities,
  archive = false,
  defaultQueries,
}) {
  const [queries, setQueries] = useState(defaultQueries);

  const { project, mutateProject } = initialProject
    ? useProject(initialProject?._id, initialProject)
    : { project: null, mutateProject: null };

  const { boards, mutateBoards } = initialProject
    ? useBoards(initialProject?._id, archive, initialBoards)
    : { boards: [], mutateBoards: null };

  const { tasks, tasksLoading, mutateTasks } = useTasks(queries, initialTasks);

  const { statuses, mutateStatuses } = initialProject
    ? useStatuses(initialProject?._id, initialStatuses)
    : useStatusesByProjects();

  const { priorities, mutatePriorities } = initialProject
    ? usePriorities(initialProject?._id, initialPriorities)
    : usePrioritiesByProjects();

  return (
    <ProjectContext.Provider
      value={{
        project,
        mutateProject,
        boards,
        mutateBoards,
        tasks,
        tasksLoading,
        mutateTasks,
        statuses,
        mutateStatuses,
        priorities,
        mutatePriorities,
        queries,
        setQueries,
        archive,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context)
    throw new Error("useProjectContext must be used within a ProjectProvider");
  return context;
}
