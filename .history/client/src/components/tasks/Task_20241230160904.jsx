import styles from "@/styles/components/tasks/task.module.css";

export default function Task({ task }) {
  return (
    <li className={styles["task"]}>
      {/* drag icon*/}
      {/* input */}
      <div>
        <input type="text" name="text" id="text" defaultValue={task?.text} />
      </div>
    </li>
  );
}
