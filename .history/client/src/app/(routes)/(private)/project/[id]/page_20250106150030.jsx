"use server";
import styles from "@/styles/pages/project.module.css";
import { getBoards } from "@/api/board";
import Boards from "@/components/Boards/Boards";
import { getProject } from "@/api/project";
import { instrumentSans } from "@/utils/font";
import { getTasks } from "@/api/task";
import AddBoard from "@/components/Boards/AddBoard";

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
          <div className={styles["project__options"]}>
            <button className={instrumentSans.className}>
              Gérer les invités
            </button>
            |
            <button className={instrumentSans.className}>
              Supprimer le projet
            </button>
          </div>
        </div>
        {/* Boards */}
        {boards?.length > 0 && <Boards projectId={id} boards={boards} />}
        <AddBoard projectId={projectId} />
      </div>
    </main>
  );
}
