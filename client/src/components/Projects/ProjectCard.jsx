import styles from "@/styles/components/projects/projectCard.module.css";
import ProjectMembers from "./ProjectMembers";
import StatusSegment from "./StatusSegment";
import Link from "next/link";
import { Star } from "lucide-react";
import Image from "next/image";
import { deleteFavorite, saveFavorite } from "@/api/favorite";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth";
import { mutate } from "swr";
import { useTranslation } from "react-i18next";

export default function ProjectCard({
  project,
  mutateProjects,
  href,
  isDefault,
}) {
  const { t } = useTranslation();
  const { uid } = useContext(AuthContext);
  const userFavIds = project?.favorites?.map((fav) => fav.user);
  const hasFav = userFavIds?.includes(uid);
  const [isFavorite, setIsFavorite] = useState(hasFav);
  const isDefaultProject = isDefault || false;

  const statuses = project?.statuses || [];

  const totalTasks = project?.tasksCount || 0;
  const totalBoards = project?.boardsCount || 0;

  const members = project?.members || [];

  const projectId = project?._id;

  const name = project?.name || t("projects.new_project");

  async function handleFavorite(e) {
    e.stopPropagation();

    if (isFavorite) {
      await RemoveFavorite();
    } else {
      await AddFavorite();
    }
  }

  async function AddFavorite() {
    setIsFavorite(true);

    const res = await saveFavorite(projectId);

    if (!res.success) {
      setIsFavorite(false);
      return;
    }

    mutateProjects();
    mutate("/favorite");
  }

  async function RemoveFavorite() {
    setIsFavorite(false);
    const favoriteId = project?.favorites?.find((fav) => fav.user === uid)?._id;

    const res = await deleteFavorite(favoriteId);

    if (!res.success) {
      setIsFavorite(true);
      return;
    }
    mutateProjects();
    mutate("/favorite");
  }

  return (
    <div
      key={projectId}
      className={styles.projectWrapper}
      data-default={isDefaultProject}
    >
      <div className={styles.starWrapper}>
        <Star
          size={18}
          className={styles.star}
          data-favorite={isFavorite}
          onClick={handleFavorite}
        />
      </div>
      <Link href={href}>
        <div className={styles.contentWrapper}>
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
                <div className={styles.memberWrapper}></div>
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
              <div className={styles.tabs}></div>
              <div className={styles.tasks}>
                <div className={styles.task} />
                <div className={styles.statusBar}></div>
              </div>
            </div>
          ) : (
            project && (
              <div className={styles.footerWrapper}>
                <span className={styles.tabs}>
                  {`${totalBoards} ${
                    totalBoards === 1
                      ? t("projects.board_singular")
                      : t("projects.board_plural")
                  }`}
                </span>
                <div className={styles.tasks}>
                  {`${totalTasks} ${
                    totalTasks === 1
                      ? t("projects.task_singular")
                      : t("projects.task_plural")
                  }`}
                  <div className={styles.statusBar}>
                    {statuses.map((status, idx) => {
                      return (
                        <StatusSegment
                          key={status?._id}
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
