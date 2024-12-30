import styles from "@/styles/components/tasks/task.module.css";

export default function Task({ task }) {
  return (
    <li className={styles["task"]}>
      {/* drag icon*/}
      {/* input */}
      <span> {task?.text}</span>
    </li>
  );
}
