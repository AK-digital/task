import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function TaskDropdown({ current, values }) {
  let text;
  if (current === "pending") text = "En attente";
  return (
    <div className={styles["dropdown"]}>
      <div className={styles["dropdown-current"]} data-current={current}>
        <span>
          {text} | <FontAwesomeIcon icon={fa} />
        </span>
      </div>
      <div className={styles["dropdown-list"]}>
        <ul></ul>
      </div>
    </div>
  );
}
