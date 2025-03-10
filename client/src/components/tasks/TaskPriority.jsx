import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskPriority } from "@/actions/task";
import { useEffect, useState } from "react";
import socket from "@/utils/socket";

const priorities = ["Basse", "Moyenne", "Haute", "Urgent"];

export default function TaskPriority({ task, project }) {
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

    if (response?.status === "failure") setOptimisticCurrent(task?.priority);

    const guests = project?.guests;

    guests.push(project?.author);

    socket.emit("task priority update", guests, task?._id, value);
  }

  useEffect(() => {
    function onTaskUpdated(taskId, optimisticValue) {
      console.log("played");
      console.log(taskId, optimisticValue);
      if (task?._id === taskId) {
        setOptimisticCurrent(optimisticValue);
      }
    }

    socket.on("task priority updated", onTaskUpdated);

    return () => {
      socket.off("task priority updated", onTaskUpdated);
    };
  }, [optimisticCurrent]);

  return (
    <div className={styles["dropdown"]}>
      <div
        className={styles["dropdown__current"]}
        data-current={optimisticCurrent}
        onClick={(e) => setIsOpen(!isOpen)}
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
