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
        <TaskDropdown current={task?.status} />
        <TaskDropdown current={task?.priority} values={["Basse"]} />
      </div>
    </li>
  );
}
