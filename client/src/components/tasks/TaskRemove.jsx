import { deleteTask } from "@/api/task";
import styles from "@/styles/components/tasks/task.module.css"; // Changement ici
import { Trash } from "lucide-react";

export default function TaskRemove({ task }) {
  async function handleDeleteTask(e) {
    e.preventDefault();
    await deleteTask(task?._id, task?.projectId);
  }

  return (
    <div className={styles.task__remove}>
      <Trash size={20} onClick={handleDeleteTask} />
    </div>
  );
}
