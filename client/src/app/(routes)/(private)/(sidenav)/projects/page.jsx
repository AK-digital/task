"use client";

import styles from "@/styles/pages/projects.module.css";
import { getProjects } from "@/api/project";
import Image from "next/image";
import { isNotEmpty } from "@/utils/utils";
import { ArrowLeftCircle, Star } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import ProjectMembers from "@/components/Projects/projectMembers";

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

                        <ProjectMembers members={members} />
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
            <div className={styles.projectWrapper}>
              <Link href="/new-project">
                <div className={styles.starWrapper} data-default="true">
                  <Star size={20} className={styles.star} data-default="true" />
                </div>

                <div className={styles.contentWrapper} data-default="true">
                  <div className={styles.imagesWrapper}>
                    <div className={styles.defaultLogoWrapper}>
                      <Image
                        className={styles.logo}
                        src="/default-project-logo.svg"
                        alt="project"
                        width={22}
                        height={22}
                      />
                    </div>

                    <div className={styles.membersWrapper}>
                      <div
                        className={styles.memberWrapper}
                        data-default="true"
                      ></div>
                    </div>
                  </div>

                  <div className={styles.nameWrapper}>
                    <span>Nouveau projet</span>
                  </div>

                  <div className={styles.footerWrapper}>
                    <div className={styles.tabs} data-default="true"></div>
                    <div className={styles.tasks} data-default="true">
                      <div className={styles.task} />
                      <div
                        className={styles.statusBar}
                        data-default="true"
                      ></div>
                    </div>
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
