import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function TaskDropdown({ current, values }) {
  const [isOpen, setIsOpen] = useState(false);
  let text;

  if (current === "pending") text = "En attente";
  if (current === "todo") text = "À faire";
  if (current === "processing") text = "En cours";
  if (current === "blocked") text = "Bloqué";
  if (current === "finished") text = "Terminée";

  if (current === "low") text = "Basse";
  if (current === "mid") text = "Moyenne";
  if (current === "high") text = "Haute";
  if (current === "urgent") text = "Urgent";

  console.log(values);

  return (
    <div className={styles["dropdown"]}>
      <div
        className={styles["dropdown-current"]}
        data-current={current}
        onClick={(e) => setIsOpen(!isOpen)}
      >
        <span>{text || current}</span>
      </div>
      {isOpen && (
        <div className={styles["dropdown-list"]}>
          <ul>
            {values.map((value, idx) => {
              return <li key={idx}>{value}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
