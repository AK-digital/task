import styles from "@/styles/components/tasks/task.module.css";
import TaskDropdown from "./TaskDropdown";
import { deleteTask, updateTask } from "@/api/task";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export default function Task({ task }) {
  const [inputValue, setInputValue] = useState(task?.text || "");

  // Créer un callback avec un délai de 300ms
  const debouncedUpdateTask = useDebouncedCallback(async (value) => {
    await updateTask(task?._id, task?.projectId, { text: value });
  }, 600);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    debouncedUpdateTask(value);
  };

  async function handleDeleteTask(e) {
    e.preventDefault();
    await deleteTask(task?._id, task?.projectId);
  }
  return (
    <li className={styles["task"]}>
      {/* drag icon*/}
      {/* input */}
      <div className={styles["task__left"]}>
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
          <div>
            <input type="date" />
          </div>
        </div>
      </div>
      <div className={styles["task__remove"]}>
        <FontAwesomeIcon icon={faTrash} onClick={handleDeleteTask} />
      </div>
    </li>
  );
}
