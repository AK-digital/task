import { deleteTask } from "@/api/task";
import styles from "@/styles/components/tasks/task-remove.module.css";

export default function TaskRemove() {
  async function handleDeleteTask(e) {
    e.preventDefault();
    await deleteTask(task?._id, task?.projectId);
  }

  return (
    <div className={styles["task__remove"]}>
      <FontAwesomeIcon icon={faTrash} onClick={handleDeleteTask} />
    </div>
  );
}
