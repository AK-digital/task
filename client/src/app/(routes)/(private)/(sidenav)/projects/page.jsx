"use client";
import styles from "@/styles/pages/projects.module.css";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/Projects/ProjectCard";
import ProjectCardSkeleton from "@/components/Projects/ProjectCardSkeleton";
import { useProjects } from "@/app/hooks/useProjects";
import { AuthContext } from "@/context/auth";
import { useContext } from "react";

export default function Projects() {
  const router = useRouter();
  const { uid } = useContext(AuthContext);
  const { projects, projectsLoading, mutateProjects } = useProjects();

  // Trier les projets par favoris (favoris en premier)
  const sortedProjects = projects?.sort((a, b) => {
    const aIsFavorite = a?.favorites?.some((fav) => fav?.user === uid) || false;
    const bIsFavorite = b?.favorites?.some((fav) => fav?.user === uid) || false;

    return bIsFavorite - aIsFavorite;
  });

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.back} onClick={() => router.back()}>
            <ArrowLeftCircle size={32} />
          </div>
          <h1 className={styles.headerH1}>Vos projets</h1>
          <div className={styles.projectCount}>
            <span>
              {projectsLoading ? "..." : `${projects?.length} projets`}
            </span>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.elements}>
            {projectsLoading ? (
              <ProjectCardSkeleton />
            ) : (
              <>
                {sortedProjects?.map((project) => {
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
      </div>
    </main>
  );
}
