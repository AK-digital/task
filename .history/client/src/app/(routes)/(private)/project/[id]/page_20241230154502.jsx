"use server";
import styles from "@/styles/pages/project.module.css";
import { getBoards } from "@/api/board";
import Boards from "@/components/Boards/Boards";
import { getProject } from "@/api/project";
import { instrumentSans } from "@/utils/font";
import { getTasks } from "@/api/task";

export default async function Project({ params }) {
  const { id } = await params;
  const project = await getProject(id);
  const boards = await getBoards(id);
  // Récupérer les tâches pour tous les boardId
  const getAllTasks = boards?.length
    ? await Promise.all(
        boards.map(async (board) => {
          const boardTasks = await getTasks(id, board?._id); // Appelle l'API pour chaque boardId
          return boardTasks; // Associe les tâches à chaque boardId
        })
      )
    : [];
  const tasks = getAllTasks.flat();

  return (
    <main className={styles["project"]}>
      <div className={styles["project__container"]}>
        {/* Project Header */}
        <div className={styles["project__header"]}>
          <span className={styles["project__name"]}>{project?.name}</span>
          <div className={styles["project__options"]}>
            <button className={instrumentSans.className}>
              Ajouter un tableau
            </button>
            |
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
        {boards?.length > 0 && <Boards boards={boards} tasks={tasks} />}
      </div>
    </main>
  );
}
