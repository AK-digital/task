"use server";

import { getProject } from "@/api/project";
import { getBoards } from "@/api/board";
import styles from "@/styles/pages/project.module.css";
import { getProjectInvitations } from "@/api/projectInvitation";
import { notFound } from "next/navigation";
import Project from "@/components/Projects/Project";
import { getTasks } from "@/api/task";
import ProjectOptions from "@/components/Projects/ProjectOptions";

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const id = slug[0];

  const archive = slug?.length > 1 && slug[1] === "archive";
  const options = slug?.length > 1 && slug[1] === "options";
  const timeTracking = slug?.length > 1 && slug[1] === "time-tracking";

  const projectData = getProject(id);
  const projectInvitationsData = getProjectInvitations(id);
  const boardsData = getBoards(id, archive);
  const tasksData = getTasks(id, archive);

  const [initialProject, projectInvitations, initialBoards, initialTasks] =
    await Promise.all([
      projectData,
      projectInvitationsData,
      boardsData,
      tasksData,
    ]);

  if (!initialProject) return notFound(); // 404

  return (
    <main className={styles.main}>
      {!options && !timeTracking && (
        <Project
          initialProject={initialProject}
          projectInvitations={projectInvitations}
          initialBoards={initialBoards}
          initialTasks={initialTasks}
          archive={archive}
        />
      )}
      {options && <ProjectOptions project={initialProject} />}
      {timeTracking && <ProjectTimeTracking project={initialProject} />}
    </main>
  );
}
