"use client";
import { deleteProject } from "@/api/project";
import { instrumentSans } from "@/utils/font";

export default function ProjectsOption({ content, projectId }) {
  async function handleDeleteProject(e) {
    e.preventDefault();
    await deleteProject(projectId);
  }

  return (
    <button className={instrumentSans.className} onClick={handleDeleteProject}>
      {content}
    </button>
  );
}
