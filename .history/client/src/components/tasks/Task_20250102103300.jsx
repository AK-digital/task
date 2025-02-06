import styles from "@/styles/components/tasks/task.module.css";
import TaskDropdown from "./TaskDropdown";
import { updateTask } from "@/api/task";

export default function Task({ task }) {
  return (
    <li className={styles["task"]}>
      {/* drag icon*/}
      {/* input */}
      <div className={styles["task__input"]}>
        <input type="text" name="text" id="text" defaultValue={task?.text} onChange={(e) => {
await updateTask(task?._id, task?.projectId, {text: e.target.value})
        }} />
      </div>
      {/* Options */}
      <div className={styles["task__options"]}>
        <TaskDropdown
          taskId={task?._id}
          projectId={task?.projectId}
          current={task?.status}
          values={["En attente", "À faire", "En cours", "Bloqué", "Terminée"]}
          type="status"
        />
        <TaskDropdown
          taskId={task?._id}
          projectId={task?.projectId}
          current={task?.priority}
          values={["Basse", "Moyenne", "Haute", "Urgent"]}
          type="priority"
        />
      </div>
    </li>
  );
}
