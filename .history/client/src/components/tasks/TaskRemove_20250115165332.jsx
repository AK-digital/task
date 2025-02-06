import { deleteTask } from "@/api/task";
import styles from "@/styles/components/tasks/task-remove.module.css";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function TaskRemove({ task }) {
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
