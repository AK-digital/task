import styles from "@/styles/components/tasks/task-remove.module.css";

export default function TaskRemove() {
  return (
    <div className={styles["task__remove"]}>
      <FontAwesomeIcon icon={faTrash} onClick={handleDeleteTask} />
    </div>
  );
}
