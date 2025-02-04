import { deleteTask } from "@/api/task";
import styles from "@/styles/components/tasks/task.module.css";
import { Trash } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../Modals/ConfirmDialog";

export default function TaskRemove({ task }) {
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDeleteTask() {
    await deleteTask(task?._id, task?.projectId);
  }

  return (
    <div className={styles.task__remove}>
      <Trash
        size={20}
        onClick={() => setShowConfirm(true)}
      />
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteTask}
        message="Supprimer cette tâche ?"
      />
    </div>
  );
}
