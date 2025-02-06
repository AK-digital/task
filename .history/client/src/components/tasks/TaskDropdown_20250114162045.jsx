import styles from "@/styles/components/tasks/task-dropdown.module.css";

import { useEffect, useState } from "react";

export default function TaskDropdown({ current, values, state }) {
  const [optimisticCurrent, setOptimisticCurrent] = useState(current);
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateTask(e) {
    e.preventDefault();
    const value = e.target.dataset.value;

    setOptimisticCurrent(value);

    const input = document.createElement("input");
    input.type = "text";
    input.name = value;
    input.id = value;
    input.defaultValue = value;
    input.hidden = "true";

    // Input will be removed even if there is an err same
    input.remove();
    setIsOpen(false);
  }

  useEffect(() => {
    // If form state status is failure then rollback the value of optimisticCurrent
    if (state.status === "failure") {
      setOptimisticCurrent(current);
    }
  }, [state]);

  return (
    <div className={styles["dropdown"]}>
      <div
        className={styles["dropdown-current"]}
        data-current={optimisticCurrent}
        onClick={(e) => setIsOpen(!isOpen)}
      >
        <span>{optimisticCurrent}</span>
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
