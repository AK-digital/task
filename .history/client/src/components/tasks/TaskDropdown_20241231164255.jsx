import styles from "@/styles/components/tasks/task-dropdown.module.css";

export default function TaskDropdown({ current, values }) {
  let text;
  if (current === "pending")
    return (
      <div className={styles["dropdown"]}>
        <div className={styles["dropdown-current"]} data-current={current}>
          <span>{current}</span>
        </div>
        <div className={styles["dropdown-list"]}>
          <ul></ul>
        </div>
      </div>
    );
}
