"use server";
import { getTasks } from "@/api/task";
import styles from "@/styles/components/boards/board.module.css";
import Tasks from "../tasks/Tasks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export default async function Board({ projectId, board }) {
  const tasks = await getTasks(projectId, board?._id);

  return (
    <div className={styles["board"]}>
      {/* Board title */}
      <div className={styles["board__header"]}>
        <span>{board?.title}</span>
        <FontAwesomeIcon icon={faTrash} />
      </div>

      {/* tasks */}
      {tasks?.length > 0 && <Tasks tasks={tasks} />}
    </div>
  );
}
