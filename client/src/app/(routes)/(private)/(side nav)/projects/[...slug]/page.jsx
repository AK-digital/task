"use server";
import { getProject } from "@/api/project";
import { getBoards } from "@/api/board";
import styles from "@/styles/pages/project.module.css";
import { getProjectInvitations } from "@/api/projectInvitation";
import ProjectClient from "@/components/Projects/ProjectClient";
import { notFound } from "next/navigation";

export default async function Project({ params }) {
  const { slug } = await params;
  const id = slug[0];

  const project = await getProject(id);
  const projectInvitations = await getProjectInvitations(id);
  const boards = await getBoards(id);

  if (!project) return notFound();

  return (
    <main className={styles.main}>
      <ProjectClient
        project={project}
        projectInvitations={projectInvitations}
        boards={boards}
      />
    </main>
  );
}
