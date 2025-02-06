import styles from "@/styles/components/tasks/task-dropdown.module.css";

export default function TaskDropdown({ current, values }) {
  return (
    <div className={styles["dropdown"]}>
      <div>
        <span>{current}</span>
      </div>
      <div className={styles["dropdown-list"]}>
        <ul></ul>
      </div>
    </div>
  );
}
