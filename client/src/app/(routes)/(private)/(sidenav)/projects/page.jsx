"use client";

import styles from "@/styles/pages/projects.module.css";
import { getProjects } from "@/api/project";
import { isNotEmpty } from "@/utils/utils";
import { ArrowLeftCircle } from "lucide-react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/Projects/ProjectCard";
import { useProjects } from "@/app/hooks/useProjects";

export default function Projects() {
  const router = useRouter();
  const { projects, projectsLoading } = useProjects();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.back} onClick={() => router.back()}>
          <ArrowLeftCircle size={32} />
        </div>
        <div className={styles.header}>
          <h1 className={styles.headerH1}>Vos projets</h1>
          <div className={styles.projectCount}>
            <span>{projects?.length} projets</span>
          </div>
        </div>

        {isNotEmpty(projects) ? (
          <div className={styles.elements}>
            {/* Projets existants */}
            {projects?.map((project) => {
              return (
                <ProjectCard
                  key={project?._id}
                  project={project}
                  href={`/projects/${project?._id}`}
                />
              );
            })}

            {/* Élément pour créer un nouveau projet */}
            <ProjectCard href="/new-project" isDefault={true} />
          </div>
        ) : (
          <div className={styles.empty}>Créez ou sélectionnez un projet.</div>
        )}
      </div>
    </main>
  );
}
