import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskStatus } from "@/actions/task";
import { useActionState, useEffect, useRef, useState } from "react";

const status = ["En attente", "À faire", "En cours", "Bloquée", "Terminée"];

const initialState = {
  status: "pending",
  message: "",
};

export default function TaskStatus({ task }) {
  const updateTaskStatusWithId = updateTaskStatus.bind(
    null,
    task?._id,
    task?.projectId
  );
  const [state, formAction, pending] = useActionState(
    updateTaskStatusWithId,
    initialState
  );
  const formRef = useRef(null);
  const [optimisticCurrent, setOptimisticCurrent] = useState(task?.status);
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateStatus(e) {
    const value = e.target.dataset.value;
    setOptimisticCurrent(value);

    document.getElementById("status").value = value;
  }

  useEffect(() => {
    // If status update fail then roll back to the old status
    if (state?.status === "failure") setOptimisticCurrent(task?.status);
  }, [state]);

  return (
    <div className={styles["dropdown"]}>
      <form
        className={styles["dropdown__form"]}
        action={formAction}
        ref={formRef}
      >
        <input
          type="text"
          id="status"
          name="status"
          value={optimisticCurrent}
          hidden
        />
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
      </form>
    </div>
  );
}
