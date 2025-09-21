"use client";
import { useBoards } from "@/hooks/api/useBoards";
import {
  usePriorities,
  usePrioritiesByProjects,
} from "@/hooks/api/usePriorities";
import { useProject } from "@/hooks/api/useProject";
import { useStatuses, useStatusesByProjects } from "@/hooks/api/useStatus";
import { useTasks } from "@/hooks/api/useTasks";
import { createContext, useContext, useState, useMemo, useCallback } from "react";

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

  // Mémoriser les callbacks pour éviter les re-renders
  const memoizedSetQueries = useCallback((newQueries) => {
    setQueries(newQueries);
  }, []);

  // Mémoriser la valeur du contexte pour éviter les re-renders inutiles
  const contextValue = useMemo(() => ({
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
    setQueries: memoizedSetQueries,
    archive,
  }), [
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
    memoizedSetQueries,
    archive,
  ]);

  return (
    <ProjectContext.Provider value={contextValue}>
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
