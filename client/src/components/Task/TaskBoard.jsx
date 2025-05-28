import styles from "@/styles/components/task/task-board.module.css";

export default function TaskBoard({ task }) {
  const board = task?.boardId;

  return (
    <div className={styles.container} id="task-row">
      <div
        className={styles.bullet}
        style={{ backgroundColor: `${board?.color}` }}
      ></div>
      <span className={styles.board}>{board?.title}</span>
    </div>
  );
}
