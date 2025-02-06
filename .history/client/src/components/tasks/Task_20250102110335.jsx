import styles from "@/styles/components/tasks/task.module.css";
import TaskDropdown from "./TaskDropdown";
import { updateTask } from "@/api/task";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function Task({ task }) {
  const [inputValue, setInputValue] = useState(task?.text || "");

  // Créer un callback avec un délai de 300ms
  const debouncedUpdateTask = useDebouncedCallback(async (value) => {
    await updateTask(task?._id, task?.projectId, { text: value });
  }, 600);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Appeler la fonction avec délai
    debouncedUpdateTask(value);
  };
  return (
    <li className={styles["task"]}>
      {/* drag icon*/}
      {/* input */}
      <div>
        <div className={styles["task__input"]}>
          <input
            type="text"
            name="text"
            id="text"
            value={inputValue}
            onChange={handleChange}
          />
        </div>
        {/* Options */}
        <div className={styles["task__options"]}>
          <TaskDropdown
            taskId={task?._id}
            projectId={task?.projectId}
            current={task?.status}
            values={["En attente", "À faire", "En cours", "Bloqué", "Terminée"]}
            type="status"
          />
          <TaskDropdown
            taskId={task?._id}
            projectId={task?.projectId}
            current={task?.priority}
            values={["Basse", "Moyenne", "Haute", "Urgent"]}
            type="priority"
          />
        </div>
      </div>
      <div></div>
    </li>
  );
}
