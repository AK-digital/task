import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskStatus } from "@/actions/task";
import { useActionState, useEffect, useRef, useState } from "react";

const status = ["En attente", "À faire", "En cours", "Bloquée", "Terminée"];

const initialState = {
  status: "pending",
  message: "",
};

export default function TaskStatus({ task }) {
  const formRef = useRef(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [optimisticCurrent, setOptimisticCurrent] = useState(task?.status);
  const [isOpen, setIsOpen] = useState(false);
  const updateTaskStatusWithId = updateTaskStatus.bind(
    null,
    task?._id,
    task?.projectId
  );
  const [state, formAction] = useActionState(
    updateTaskStatusWithId,
    initialState
  );

  async function handleUpdateStatus(e) {
    const value = e.target.dataset.value;
    setOptimisticCurrent(value);

    setSelectedStatus(value);

    // document.querySelectorAll("#status").value = value;

    // setIsOpen(false);

    // formRef.current.requestSubmit();
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
          defaultValue={optimisticCurrent}
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
