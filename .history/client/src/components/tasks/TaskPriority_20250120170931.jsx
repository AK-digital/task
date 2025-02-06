import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskPriority } from "@/actions/task";
import { useState } from "react";

const priorities = ["Basse", "Moyenne", "Haute", "Urgent"];

export default function TaskPriority({ task }) {
  const [optimisticCurrent, setOptimisticCurrent] = useState(task?.priority);
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateStatus(e) {
    const value = e.target.dataset.value;
    setOptimisticCurrent(value);

    await updateTaskPriority(task?._id, task?.projectId);

    setIsOpen(false);
  }

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
              {priorities?.map((value, idx) => {
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
