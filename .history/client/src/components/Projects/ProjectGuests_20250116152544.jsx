"use client";
import { deleteProject } from "@/api/project";
import { instrumentSans } from "@/utils/font";
import { useRouter } from "next/navigation";

export default function ProjectsOption({ content, projectId }) {
  const router = useRouter();

  return (
    <button className={instrumentSans.className} onClick={handleDeleteProject}>
      {content}
    </button>
  );
}
