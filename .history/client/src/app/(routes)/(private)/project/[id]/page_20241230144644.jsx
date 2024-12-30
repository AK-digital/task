"use server";
import styles from "@/styles/pages/project.module.css";
import { getBoards } from "@/api/board";
import Boards from "@/components/Boards/Boards";
import { getProject } from "@/api/project";

export default async function Project({ params }) {
  const { id } = await params;
  const project = await getProject(id);
  const boards = await getBoards(id);

  return (
    <main className={styles["project"]}>
      <div className={styles["project__container"]}>
        {/* Project Header */}
        <div className={styles["project__header"]}>
          <span className={styles["project__name"]}>{project?.name}</span>
        </div>

        {/* Boards */}
        {boards?.length > 0 && (
          <div className={styles["project__boards"]}>
            <Boards boards={boards} />
          </div>
        )}
      </div>
    </main>
  );
}
