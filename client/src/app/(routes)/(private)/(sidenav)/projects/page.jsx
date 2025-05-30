"use client";
import styles from "@/styles/pages/projects.module.css";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/Projects/ProjectCard";
import ProjectCardSkeleton from "@/components/Projects/ProjectCardSkeleton";
import { useProjects } from "@/app/hooks/useProjects";

export default function Projects() {
  const router = useRouter();
  const { projects, projectsLoading, mutateProjects } = useProjects();
  // Sort projects by favorites
  projects?.sort((a, b) => {
    return b.favorites?.length - a.favorites?.length;
  });

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.back} onClick={() => router.back()}>
          <ArrowLeftCircle size={32} />
        </div>
        <div className={styles.header}>
          <h1 className={styles.headerH1}>Vos projets</h1>
          <div className={styles.projectCount}>
            <span>
              {projectsLoading ? "..." : `${projects?.length} projets`}
            </span>
          </div>
        </div>

        <div className={styles.elements}>
          {projectsLoading ? (
            <ProjectCardSkeleton />
          ) : (
            <>
              {projects?.map((project) => {
                return (
                  <ProjectCard
                    key={project?._id}
                    project={project}
                    mutateProjects={mutateProjects}
                    href={`/projects/${project?._id}`}
                  />
                );
              })}
            </>
          )}
          {/* Élément pour créer un nouveau projet */}
          <ProjectCard href="/new-project" isDefault={true} />
        </div>
      </div>
    </main>
  );
}
