import styles from "@/styles/components/task/task-board.module.css";

export default function TaskBoard({ task }) {
  const board = task?.boardId;

  return (
    <div className={styles.container} id="task-row">
      <span
        className={styles.board}
        style={{ border: `1px solid ${board?.color}` }}
      >
        {board?.title}
      </span>
    </div>
  );
}
