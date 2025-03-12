"use client";

import styles from "@/styles/pages/projects.module.css";
import { getProjects } from "@/api/project";
import Image from "next/image";
import { isNotEmpty } from "@/utils/utils";
import { ListTodo, Users, Plus, ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";

export default function Projects() {
  const router = useRouter();
  const { data, isLoading } = useSWR("/api/project", getProjects);
  const projects = data;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.back} onClick={() => router.back()}>
          <ArrowLeftCircle size={32} />
        </div>
        <div className={styles.header}>
          <h1>Vos projets</h1>
          <div className={styles.projectCount}>
            <span>{projects?.length} projets</span>
          </div>
        </div>

        {isNotEmpty(projects) ? (
          <div className={styles.elements}>
            {/* Projets existants */}
            {projects?.map((project) => (
              <div key={project?._id}>
                <Link href={`/projects/${project?._id}`}>
                  <div className={styles.element}>
                    <Image
                      className={styles.logo}
                      src={project?.logo || "/default-project-logo.webp"}
                      alt="project"
                      width={45}
                      height={45}
                      style={{ borderRadius: "50%", cursor: "pointer" }}
                    />
                    <div className={styles.infos}>
                      <div className={styles.name}>
                        <span>{project?.name}</span>
                      </div>
                      <div className={styles.stats}>
                        <span>
                          <ListTodo size={16} />
                          {project?.tasksCount}
                        </span>
                        <span>
                          <Users size={16} />
                          {project?.guests?.length + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {/* Élément pour créer un nouveau projet */}
            <div className={`${styles.element} ${styles.newProject}`}>
              <Link href="/new-project">
                <div className={styles.newProjectContent}>
                  <div className={styles.plusIconWrapper}>
                    <Plus size={30} />
                  </div>
                  <div className={styles.newProjectText}>
                    <span>Créer un nouveau projet</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>Créez ou sélectionnez un projet.</div>
        )}
      </div>
    </main>
  );
}
