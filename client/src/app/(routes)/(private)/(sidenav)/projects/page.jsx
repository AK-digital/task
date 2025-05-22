"use client";

import styles from "@/styles/pages/projects.module.css";
import { getProjects } from "@/api/project";
import Image from "next/image";
import { isNotEmpty } from "@/utils/utils";
import { Plus, ArrowLeftCircle, Star } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";

export default function Projects() {
  const router = useRouter();
  const { data: projects } = useSWR("/api/project", getProjects);

  const statusColors = {
    "En attente": "#b3bcc0",
    "À estimer": "#62c3b0",
    "En cours": "#f3b158",
    "À faire": "#559fc6",
    "À vérifier": "#9d88c2",
    Bloquée: "#ca4250",
    Terminée: "#63a758",
  };

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
              const status = project?.taskStatuses || [];
              const entries = Object.entries(status).filter(
                ([, count]) => count > 0
              );

              const totalTasks = project?.tasksCount || 0;
              const totalBoards = project?.boardsCount || 0;

              const members = project?.members || [];

              const projectId = project?._id;

              return (
                <div key={projectId} className={styles.projectWrapper}>
                  <Link href={`/projects/${projectId}`}>
                    <div className={styles.starWrapper}>
                      <Star size={20} className={styles.star} />
                    </div>
                    <div className={styles.contentWrapper}>
                      <div className={styles.imagesWrapper}>
                        <Image
                          className={styles.logo}
                          src={project?.logo || "/default-project-logo.webp"}
                          alt="project"
                          width={45}
                          height={45}
                          style={{ borderRadius: "50%", cursor: "pointer" }}
                        />

                        <div className={styles.membersWrapper}>
                          {/* Membres du projet (affiche max 4) */}
                          {members.slice(0, 4).map((member) => (
                            <div
                              key={member?.user?._id}
                              className={styles.memberWrapper}
                            >
                              <Image
                                className={styles.member}
                                src={
                                  member?.user?.picture || "/default-pfp.webp"
                                }
                                alt="member"
                                width={30}
                                height={30}
                              />
                            </div>
                          ))}

                          {/* Affichage "+n" si plus de 4 membres */}
                          {members.length > 4 && (
                            <div className={styles.memberWrapper}>
                              <div className={styles.moreMembers}>
                                +{members.length - 4}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={styles.nameWrapper}>
                        <span>{project?.name}</span>
                      </div>

                      {project && (
                        <div className={styles.footerWrapper}>
                          <span className={styles.tabs}>
                            {`${totalBoards} tableau${
                              totalBoards === 1 ? "" : "x"
                            }`}
                          </span>
                          <div className={styles.tasks}>
                            {`${totalTasks} tâche${
                              totalTasks === 1 ? "" : "s"
                            }`}
                            <div className={styles.statusBar}>
                              {entries.map(([status, count]) => {
                                const percentage = (count / totalTasks) * 100;

                                return (
                                  <div
                                    key={status}
                                    className={styles.statusSegment}
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor:
                                        statusColors[status] || "#ccc",
                                    }}
                                    title={`${status} (${count})`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}

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
