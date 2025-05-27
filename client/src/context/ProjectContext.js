"use client";
import { useBoards } from "@/app/hooks/useBoards";
import { usePriorities } from "@/app/hooks/usePriorities";
import { useProject } from "@/app/hooks/useProject";
import { useStatuses } from "@/app/hooks/useStatus";
import { useTasks } from "@/app/hooks/useTasks";
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
}) {
  const [queries, setQueries] = useState({
    projectId: initialProject?._id,
    archived: archive,
  });
  const { project, mutateProject } = useProject(
    initialProject._id,
    initialProject
  );
  const { boards, mutateBoards } = useBoards(
    initialProject._id,
    archive,
    initialBoards
  );
  const { tasks, mutateTasks } = useTasks(queries, initialTasks);
  const { statuses, mutateStatuses } = useStatuses(
    initialProject._id,
    initialStatuses
  );
  const { priorities, mutatePriorities } = usePriorities(
    initialProject._id,
    initialPriorities
  );

  return (
    <ProjectContext.Provider
      value={{
        project,
        mutateProject,
        boards,
        mutateBoards,
        tasks,
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
