import styles from "@/styles/components/boards/board.module.css";
export default function Board({ board }) {
  return (
    <div className={styles["board"]}>
      {/* Board title */}
      <div>
        <div className={styles["board__title"]}>
          <span>{board?.title}</span>
        </div>
      </div>
      {/* tasks */}
    </div>
  );
}
