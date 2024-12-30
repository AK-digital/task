import styles from "@/styles/components/boards/board.module.css";
export default function Board({ board }) {
  return (
    <div className={styles["board"]}>
      {/* Board title */}
      <div>
        <span>{board?.title}</span>
      </div>
      {/* tasks */}
    </div>
  );
}
