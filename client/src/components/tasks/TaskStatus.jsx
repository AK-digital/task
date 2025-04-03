"use client";
import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskStatus } from "@/actions/task";
import { useCallback, useEffect, useState } from "react";
import socket from "@/utils/socket";
import { revalidateBoards } from "@/api/board";
import { set } from "zod";
import { checkRole } from "@/utils/utils";

const status = ["En attente", "À faire", "En cours", "Bloquée", "Terminée"];

export default function TaskStatus({ task, project, uid }) {
  const [optimisticCurrent, setOptimisticCurrent] = useState(task?.status);
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateStatus(e) {
    const value = e.target.dataset.value;
    setOptimisticCurrent(value);
    setIsOpen(false);

    const response = await updateTaskStatus(task?._id, task?.projectId, value);

    if (response?.status === "failure") {
      setOptimisticCurrent(task?.status);
      return;
    }

    const guests = [...project?.guests, project?.author];

    socket.emit("task status update", guests, task?._id, value);
  }

  useEffect(() => {
    function onTaskUpdated(taskId, optimisticValue) {
      if (task?._id === taskId) {
        setOptimisticCurrent(optimisticValue);
      }
    }

    socket.on("task status updated", onTaskUpdated);

    return () => {
      socket.off("task status updated", onTaskUpdated);
    };
  }, [optimisticCurrent]);

  const handleIsOpen = useCallback(() => {
    const isAuthorized = checkRole(
      project,
      ["owner", "manager", "team", "customer"],
      uid
    );

    if (!isAuthorized) return;

    setIsOpen((prev) => !prev);
  }, [project, uid]);

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
            onClick={(e) => setIsOpen(false)}
          ></div>
        </>
      )}
    </div>
  );
}
