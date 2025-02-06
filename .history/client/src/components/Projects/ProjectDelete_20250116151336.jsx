"use client";
import { deleteProject } from "@/api/project";
import { instrumentSans } from "@/utils/font";
import { useRouter } from "next/navigation";

export default function ProjectDelete({ projectId }) {
  const router = useRouter();

  async function handleDeleteProject(e) {
    e.preventDefault();
    await deleteProject(projectId);
    router.push("/project");
  }

  return (
    <button className={instrumentSans.className} onClick={handleDeleteProject}>
      Supprimer le projet
    </button>
  );
}
