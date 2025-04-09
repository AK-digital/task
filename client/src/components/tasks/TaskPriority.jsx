import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskPriority } from "@/actions/task";
import { useCallback, useEffect, useState } from "react";
import socket from "@/utils/socket";
import { checkRole } from "@/utils/utils";

const priorities = ["Basse", "Moyenne", "Haute", "Urgent"];

export default function TaskPriority({ task, project, uid }) {
  const [optimisticCurrent, setOptimisticCurrent] = useState(task?.priority);
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateStatus(e) {
    const value = e.target.dataset.value;
    setOptimisticCurrent(value);
    setIsOpen(false);

    const response = await updateTaskPriority(
      task?._id,
      task?.projectId,
      value
    );

    if (response?.status === "failure") {
      setOptimisticCurrent(task?.priority);
      return;
    }

    socket.emit("update task", project?._id);
  }

  useEffect(() => {
    setOptimisticCurrent(task?.priority);
  }, [task?.priority]);

  const handleIsOpen = useCallback(() => {
    const isAuthorized = checkRole(
      project,
      ["owner", "manager", "team", "customer"],
      uid
    );

    if (!isAuthorized) return;

    setIsOpen((prev) => !prev);
  });

  return (
    <div className={styles["dropdown"]}>
      <div
        className={styles["dropdown__current"]}
        data-current={optimisticCurrent}
        onClick={handleIsOpen}
      >
        <span>{optimisticCurrent}</span>
      </div>
      {isOpen && (
        <>
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
          <div
            id="modal-layout-opacity"
            onClick={(e) => setIsOpen(false)}
          ></div>
        </>
      )}
    </div>
  );
}
