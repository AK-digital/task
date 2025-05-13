"use client";
import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskStatus } from "@/actions/task";
import { useCallback, useEffect, useState } from "react";
import socket from "@/utils/socket";
import { checkRole } from "@/utils/utils";

const status = [
  "En attente",
  "À faire",
  "En cours",
  "À vérifier",
  "Bloquée",
  "Terminée",
];

export default function TaskStatus({ task, project, uid, handleStopPropa }) {
  const [optimisticCurrent, setOptimisticCurrent] = useState(task?.status);
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateStatus(e) {
    e.stopPropagation();
    const value = e.target.dataset.value;
    setOptimisticCurrent(value);
    setIsOpen(false);

    const response = await updateTaskStatus(task?._id, task?.projectId, value);

    if (response?.status === "failure") {
      setOptimisticCurrent(task?.status);
      return;
    }

    socket.emit("update task", project?._id);
  }

  useEffect(() => {
    setOptimisticCurrent(task?.status);
  }, [task?.status]);

  const handleIsOpen = useCallback(
    (e) => {
      e.stopPropagation();

      const isAuthorized = checkRole(
        project,
        ["owner", "manager", "team", "customer"],
        uid
      );

      if (!isAuthorized) return;

      setIsOpen((prev) => !prev);
    },
    [project, uid]
  );

  return (
    <div
      className={styles["dropdown"]}
      data-is-open={isOpen ? "true" : "false"}
      onClick={(e) => handleStopPropa(e, isOpen)}
    >
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
              {status?.map((value, idx) => {
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
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          ></div>
        </>
      )}
    </div>
  );
}
