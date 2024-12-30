"use server";
import { getTasks } from "@/api/task";
import styles from "@/styles/components/boards/board.module.css";

export default async function Board({ board }) {
  const tasks = await getTasks(board?._id);
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
