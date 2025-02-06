import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { useState } from "react";

export default function TaskDropdown({ current, values, type, form }) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateTask(e) {
    e.preventDefault();
    const value = e.target.dataset.value;
    setSelectedValue(value);
    form.current.requestSubmit();
    setIsOpen(false);
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
                  {type === "status" && (
                    <input
                      type="text"
                      name={value}
                      id={value}
                      hidden
                      defaultValue={value}
                    />
                  )}
                  {type === "priority" && (
                    <input
                      type="text"
                      name={value}
                      id={value}
                      hidden
                      defaultValue={value}
                    />
                  )}
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
