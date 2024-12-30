"use server";
import { getTasks } from "@/api/task";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { deleteBoard } from "@/api/board";

export default async function Board({ projectId, board }) {
  const tasks = await getTasks(projectId, board?._id);

  async function deleteBoard(e) {
    e.preventDefault();

    await deleteBoard(board?._id, projectId);
  }

  return (
    <div className={styles["board"]}>
      {/* Board title */}
      <div className={styles["board__header"]}>
        <span>{board?.title}</span>
        <FontAwesomeIcon icon={faTrash} onClick={deleteBoard} />
      </div>

      {/* tasks */}
      {tasks?.length > 0 && <Tasks tasks={tasks} />}
    </div>
  );
}
