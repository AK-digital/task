import { useState } from "react";

const status = ["En attente", "À faire", "En cours", "Bloquée", "Terminée"];

export default function TaskStatus({ task }) {
  const [optimisticCurrent, setOptimisticCurrent] = useState(task?.status);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles["dropdown"]}>
      <form className={styles["dropdown__form"]} action="">
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
              {status.map((value, idx) => {
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
