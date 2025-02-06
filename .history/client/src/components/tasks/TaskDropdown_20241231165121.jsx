import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function TaskDropdown({ current, values }) {
  let text;
  if (current === "pending") text = "En attente";
  if (current === "processing") text = "En cours";
  if (current === "pending") text = "En attente";
  if (current === "pending") text = "En attente";
  if (current === "finished") text = "Terminée";

  text = current;
  return (
    <div className={styles["dropdown"]}>
      <div className={styles["dropdown-current"]} data-current={current}>
        <span>{text}</span>
      </div>
      <div className={styles["dropdown-list"]}>
        <ul></ul>
      </div>
    </div>
  );
}
