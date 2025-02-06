import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskPriority, updateTaskStatus } from "@/actions/task";
import { useActionState, useEffect, useRef, useState } from "react";

const status = ["Basse", "Moyenne", "Haute", "Urgent"];

const initialState = {
  status: "pending",
  message: "",
};

export default function TaskPriority({ task }) {
  const formRef = useRef(null);
  const [optimisticCurrent, setOptimisticCurrent] = useState(task?.priority);
  const [isOpen, setIsOpen] = useState(false);

  const updateTaskPriorityWithId = updateTaskPriority.bind(
    null,
    task?._id,
    task?.projectId
  );

  const [state, formAction] = useActionState(
    updateTaskPriorityWithId,
    initialState
  );

  async function handleUpdateStatus(e) {
    const value = e.target.dataset.value;
    setOptimisticCurrent(value);

    document.getElementById("status").value = value;

    formRef.current.requestSubmit();
  }

  useEffect(() => {
    // If status update fail then roll back to the old status
    if (state?.status === "failure") setOptimisticCurrent(task?.priority);
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
          id="priority"
          name="priority"
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
