import { updateTask } from "@/api/task";
import styles from "@/styles/components/tasks/task-dropdown.module.css";

import { useState } from "react";

export default function TaskDropdown({ current, values, type, form }) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateTask(e) {
    e.preventDefault();
    const value = e.target.dataset.value;

    const input = document.createElement("input");
    input.type = "text";
    input.name = value;
    input.id = value;
    input.hidden = "true";

    e.target.appendChild(input);
    // await updateTask(taskId, projectId, {
    //   [type]: value,
    // });

    form.current.requestSubmit();

    // input.remove();

    // setIsOpen(false);
  }

  return (
    <div className={styles["dropdown"]}>
      <div
        className={styles["dropdown-current"]}
        data-current={current}
        onClick={(e) => setIsOpen(!isOpen)}
      >
        <span>{current}</span>
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
