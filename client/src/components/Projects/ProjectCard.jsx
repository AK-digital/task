import styles from "@/styles/components/projects/projectCard.module.css";
import ProjectMembers from "./ProjectMembers";
import StatusSegment from "./StatusSegment";
import Link from "next/link";
import { Star } from "lucide-react";
import Image from "next/image";

export default function ProjectCard({ project, href, isDefault }) {
  const isDefaultProject = isDefault || false;

  const status = project?.taskStatuses || [];
  const entries = Object.entries(status).filter(([, count]) => count > 0);

  const totalTasks = project?.tasksCount || 0;
  const totalBoards = project?.boardsCount || 0;

  const members = project?.members || [];

  const projectId = project?._id;

  const name = project?.name || "Nouveau projet";

  return (
    <div key={projectId} className={styles.projectWrapper}>
      <Link href={href}>
        <div className={styles.starWrapper} data-default={isDefaultProject}>
          <Star
            size={16}
            className={styles.star}
            data-default={isDefaultProject}
          />
        </div>
        <div className={styles.contentWrapper} data-default={isDefaultProject}>
          {isDefaultProject ? (
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
                <div className={styles.memberWrapper} data-default="true"></div>
              </div>
            </div>
          ) : (
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
          )}

          <div className={styles.nameWrapper}>
            <span>{name}</span>
          </div>

          {isDefaultProject ? (
            <div className={styles.footerWrapper}>
              <div className={styles.tabs} data-default="true"></div>
              <div className={styles.tasks} data-default="true">
                <div className={styles.task} />
                <div className={styles.statusBar} data-default="true"></div>
              </div>
            </div>
          ) : (
            project && (
              <div className={styles.footerWrapper}>
                <span className={styles.tabs}>
                  {`${totalBoards} tableau${totalBoards === 1 ? "" : "x"}`}
                </span>
                <div className={styles.tasks}>
                  {`${totalTasks} tâche${totalTasks === 1 ? "" : "s"}`}
                  <div className={styles.statusBar}>
                    {entries.map(([status, count]) => {
                      return (
                        <StatusSegment
                          key={status}
                          count={count}
                          status={status}
                          totalTasks={totalTasks}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </Link>
    </div>
  );
}
