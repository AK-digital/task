import { updateTask } from "@/api/task";
import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function TaskDropdown({
  taskId,
  projectId,
  current,
  values,
  type,
}) {
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

  async function handleUpdateTask(e) {
    e.preventDefault();
    console.log(e.currentTarget.value);
    await updateTask(taskId, projectId, {
      status: "processing",
      priority: "urgent",
    });
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
                  <form action="">
                    {type === "status" && (
                      <input
                        type="text"
                        name={type === "status"}
                        hidden
                        defaultValue={value}
                      />
                    )}
                  </form>
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
