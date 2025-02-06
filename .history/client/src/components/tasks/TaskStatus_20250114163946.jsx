import { useState } from "react";

export default function TaskStatus({ task }) {
  const [optimisticCurrent, setOptimisticCurrent] = useState(task?.status);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles["dropdown"]}>
      <form action="">
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
      </form>
    </div>
  );
}
