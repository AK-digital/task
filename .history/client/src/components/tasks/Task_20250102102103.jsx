import styles from "@/styles/components/tasks/task.module.css";
import TaskDropdown from "./TaskDropdown";

export default function Task({ task }) {
  return (
    <li className={styles["task"]}>
      {/* drag icon*/}
      {/* input */}
      <div className={styles["task__input"]}>
        <input type="text" name="text" id="text" defaultValue={task?.text} />
      </div>
      {/* Options */}
      <div className={styles["task__options"]}>
        <TaskDropdown
          taskId={task?._id}
          projectId={task?.projectId}
          current={task?.status}
          values={["En attente", "À faire", "En cours", "Bloqué", "Terminée"]}
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
