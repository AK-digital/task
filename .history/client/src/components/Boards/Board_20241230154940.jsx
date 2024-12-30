"use server";
import { getTasks } from "@/api/task";
import styles from "@/styles/components/boards/board.module.css";

export default async function Board({ projectId, board }) {
  const tasks = await getTasks(projectId, board?._id);

  console.log(tasks);
  return (
    <div className={styles["board"]}>
      {/* Board title */}
      <div className={styles["board__header"]}>
        <span>{board?.title}</span>
      </div>

      {/* tasks */}
    </div>
  );
}
