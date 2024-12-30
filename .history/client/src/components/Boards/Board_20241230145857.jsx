import styles from "@/styles/components/boards/board.module.css";
export default function Board({ board }) {
  return (
    <div className={styles["board"]}>
      {/* Board title */}
      <div className={styles["board__header"]}>
        <div className={styles["board__title"]}>
          <span>{board?.title}</span>
        </div>
      </div>
      {/* tasks */}
    </div>
  );
}
