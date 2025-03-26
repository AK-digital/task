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

  const [project, projectInvitations, boards] = await Promise.all([
    projectData,
    projectInvitationsData,
    boardsData,
  ]);

  const tasks = boards?.length
    ? await Promise.all(
        boards.map((board) => getTasks(id, board?._id, archive))
      )
    : [];

  if (!project) return notFound(); // 404

  return (
    <main className={styles.main}>
      {!options && !timeTracking && (
        <Project
          project={project}
          projectInvitations={projectInvitations}
          boards={boards}
          tasks={tasks}
          archive={archive}
        />
      )}
      {options && <ProjectOptions project={project} />}
      {timeTracking && <ProjectTimeTracking project={project} />}
    </main>
  );
}
