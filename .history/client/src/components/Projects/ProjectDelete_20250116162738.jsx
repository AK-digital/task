"use client";
import styles from "@/styles/components/projects/project-delete.module.css";
import { deleteProject } from "@/api/project";
import { instrumentSans } from "@/utils/font";
import { useRouter } from "next/navigation";

export default function ProjectDelete({ project }) {
  const router = useRouter();

  async function handleDeleteProject(e) {
    e.preventDefault();
    await deleteProject(project?._id);
    router.push("/project");
  }

  return (
    <button
      className={`${instrumentSans.className} ${styles.button}`}
      onClick={handleDeleteProject}
    >
      Supprimer le projet
    </button>
  );
}
