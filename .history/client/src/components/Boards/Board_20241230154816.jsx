"use server";
import styles from "@/styles/components/boards/board.module.css";

export default async function Board({ board }) {
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
