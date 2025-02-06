import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskStatus } from "@/actions/task";
import { useState } from "react";

const status = ["En attente", "À faire", "En cours", "Bloquée", "Terminée"];

const initialState = {
  status: "pending",
  message: "",
};

export default function TaskStatus({ task }) {
  const [optimisticCurrent, setOptimisticCurrent] = useState(task?.status);
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateStatus(e) {
    const value = e.target.dataset.value;
    setOptimisticCurrent(value);

    const response = await updateTaskStatus(task?._id, task?.projectId, value);

    if (response?.status === "failure") setOptimisticCurrent(task?.status);
  }

  return (
    <div className={styles["dropdown"]}>
      <div
        className={styles["dropdown__current"]}
        data-current={optimisticCurrent}
        onClick={(e) => setIsOpen(!isOpen)}
      >
        <span>{optimisticCurrent}</span>
      </div>
      {isOpen && (
        <div className={styles["dropdown__list"]}>
          <ul>
            {status?.map((value, idx) => {
              return (
                <li key={idx} data-value={value} onClick={handleUpdateStatus}>
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
