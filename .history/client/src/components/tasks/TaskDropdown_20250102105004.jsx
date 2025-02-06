import { updateTask } from "@/api/task";
import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const STATUS_TEXTS = {
  pending: "En attente",
  todo: "À faire",
  processing: "En cours",
  blocked: "Bloqué",
  finished: "Terminée",
};

const PRIORITY_TEXTS = {
  low: "Basse",
  mid: "Moyenne",
  high: "Haute",
  urgent: "Urgent",
};

export default function TaskDropdown({
  taskId,
  projectId,
  current,
  values,
  type,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const text = STATUS_TEXTS[current] || PRIORITY_TEXTS[current] || current;

  async function handleUpdateTask(e) {
    e.preventDefault();
    const value = e.target.dataset.value;
    console.log(e.target.dataset.value);

    if (type === "status") {
      const reverseMapping = {
        ...Object.entries(STATUS_TEXTS).reduce(
          (acc, [key, val]) => ({ ...acc, [val]: key }),
          {}
        ),
        ...Object.entries(PRIORITY_TEXTS).reduce(
          (acc, [key, val]) => ({ ...acc, [val]: key }),
          {}
        ),
      };

      const key = reverseMapping[value]; // Convertir le texte en clé

      console.log(key)
    }

      // await updateTask(taskId, projectId, {
      //   status: value,
      // });
    }
    // if (type === "priority") {
    //   await updateTask(taskId, projectId, {
    //     status: value,
    //   });
    // }
  }
}

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
              return (
                <li key={idx} data-value={value} onClick={handleUpdateTask}>
                  {value}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
