import styles from "@/styles/components/tasks/task-dropdown.module.css";

export default function TaskDropdown({ current, values }) {
  return (
    <div className={styles["container"]}>
      <div>
        <span>{current}</span>
      </div>
      <div>
        <ul></ul>
      </div>
    </div>
  );
}
