"use server";

import { getProject } from "@/api/project";
import { getBoards } from "@/api/board";
import { notFound } from "next/navigation";
import Project from "@/components/Projects/Project";
import { getTasks } from "@/api/task";
import ProjectOptions from "@/components/Projects/ProjectOptions";
import { getStatusByProject } from "@/api/status";
import { ProjectProvider } from "@/context/ProjectContext";
import { getPriorityByProject } from "@/api/priority";

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const id = slug[0];

  const archive = slug?.length > 1 && slug[1] === "archive";
  const options = slug?.length > 1 && slug[1] === "options";
  const timeTracking = slug?.length > 1 && slug[1] === "time-tracking";

  const projectData = getProject(id);
  const boardsData = getBoards(id, archive);
  const tasksData = getTasks({ projectId: id, archived: archive });
  const statusesData = getStatusByProject(id);
  const prioritiesData = getPriorityByProject(id);

  const [initialProject, initialBoards, initialTasks] = await Promise.all([
    projectData,
    boardsData,
    tasksData,
    statusesData,
    prioritiesData,
  ]);

  if (!initialProject) return notFound(); // 404

  const defaultQueries = {
    projectId: initialProject?._id,
    archived: archive,
  };

  return (
    <ProjectProvider
      initialProject={initialProject}
      initialBoards={initialBoards}
      initialTasks={initialTasks}
      initialStatuses={statusesData}
      initialPriorities={prioritiesData}
      archive={archive}
      defaultQueries={defaultQueries}
    >
      <main className="w-full ml-6 min-w-0 max-h-[calc(100svh-64px)]">
        {!options && !timeTracking && <Project />}
        {options && <ProjectOptions project={initialProject} />}
        {timeTracking && <ProjectTimeTracking project={initialProject} />}
      </main>
    </ProjectProvider>
  );
}
