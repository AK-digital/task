import styles from "@/styles/components/tasks/task.module.css";

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
        <div className={styles["task__option"]}>Editer</div>
      </div>
    </li>
  );
}
